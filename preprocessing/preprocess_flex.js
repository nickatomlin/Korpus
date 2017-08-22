/* Run this script from the main directory (Korpus) */

const fs = require('fs');
const util = require('util');
const parseXml = require('xml2js').parseString; // or we could use simple-xml
const tierRegistry = require('./tier_registry').tierRegistry;
const helper = require('./helper_functions');

function isStartPunctuation(punct) {
  return (punct === "¿") || (punct === "(");
}

function isSeparator(char) {
  return (char === "-") || (char === "=") || (char === "~");
}

/*
function updateMetadata(xmlFileContent, indexData) {
    const thingy = {
        "timed": false, //always
        "media": {}, //always
        "languages": ["es", "en", "con-Latn-EC"],
        "date_created": "",
        "date_uploaded": "",
        "source": {
            "default": "Mitos del Pueblo Cofán",
            "es": "Blaser, Magdalena \"Mitos del pueblo Cofán\"",
            "con-Latn-EC": "Blaser, Magdalena \"A'indeccu canqque'sune condase'cho\""
        }
    };

    const langsIn = jsonIn["document"]["interlinear-text"][0]["languages"];
    const langs = [];
    for (const lang of langsIn) {
        langs.push(lang['$']['lang']);
    }

    const itemsIn = jsonIn["document"]["interlinear-text"][0]["item"];
    const sources = {};
    for (const datum of metadataIn) {
        if (datum['$']['type'] === 'source') {
            langsIn.push(datum['$'][''])
        } else if (datum['$']['type'] === 'title' && current_title['$']['lang'] === 'con-Latn-EC') {
            jsonOut.metadata.title = current_title['_'].substr(current_title['_'].indexOf(" ") + 1);
        }
    }

}*/

function preprocess(xmlFileName, jsonFileName, shortFileName, isoDict, callback) {
  const jsonOut = {
    "metadata": {},
    "sentences": []
  };

  parseXml(fs.readFileSync(xmlFileName), function (err, jsonIn) {
    if (err) throw err;

    /////////////////////////////////////////
    // Nick's index-updating code begins here
    /////////////////////////////////////////
    let metadata = helper.improveFLExIndexData(xmlFileName, jsonIn["document"]["interlinear-text"][0]);
    jsonOut.metadata = metadata;
    jsonOut.metadata["tier IDs"] = {};
    const tierReg = new tierRegistry({}, jsonOut.metadata["tier IDs"], isoDict);

    // update the index.json file
    let index = JSON.parse(fs.readFileSync("data/index2.json", "utf8"));
    index[helper.getFilenameFromPath(xmlFileName)] = metadata;
    fs.writeFileSync("data/index2.json", JSON.stringify(index, null, 2));
    ///////////////////////////////////////
    // Nick's index-updating code ends here
    ///////////////////////////////////////

    // set textLang to the language of the first word
    const paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph;
    const paragraph = paragraphs[0].phrases[0].word;
    const sentence = paragraph[0].words[0].word;
    const wordLang = sentence[0].item[0].$.lang;
    let textLang = wordLang;
    if (textLang === null) {
      textLang = "defaultLang";
    }

    const wordsTierID = tierReg.maybeRegisterTier(textLang, "words", true); // writes to jsonOut.metadata (!)

    // const paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph; // defined above
    for (const wrappedParagraph of paragraphs) {
      if (wrappedParagraph.phrases == null) continue; // if this paragraph is empty, skip it instead of erroring
      const paragraph = wrappedParagraph.phrases[0].word;
      for (const wrappedSentence of paragraph) {
        if (wrappedSentence.words == null) continue; // if this sentence is empty, skip it instead of erroring
        const sentence = wrappedSentence.words[0].word;

        const glommedMorphs = {}; // tierID -> start_slot -> {"value": value, "end_slot": end_slot}
        glommedMorphs[wordsTierID] = {};
        let slotNum = 0;
        const sentenceTokens = []; // for building the free transcription sentenceText
        // FIXME words tier will show up even when the sentence is empty of words

        for (const wordWithMorphs of sentence) {
          const wordValue = wordWithMorphs.item[0]._;
          const wordStartSlot = slotNum;
          // process.stdout.write("\n" + wordValue + " "); // for debugging

          if (wordWithMorphs.morphemes != null) {
            const morphs = wordWithMorphs.morphemes[0].morph;
            const morphsToGlom = {};
            for (const wrappedMorph of morphs) {
              const morphTiers = wrappedMorph.item;
              for (const tier of morphTiers) {
                // record the morph's value so it can be included in the output
                const tierID = tierReg.maybeRegisterTier(tier.$.lang, tier.$.type, true);
                if (tierID != null) {
                  let tierValue = tier._;

                  // insert missing '-' if needed (FLEX seems to omit them in glosses of affixes)
                  if (tier.$.type === 'gls') { // part of speech
                    if (wrappedMorph.$ == null) {
                      // TODO I have no idea why this happens sometimes but it does
                      // console.log(wrappedMorph); // for debugging
                    } else {
                      const partOfSpeech = wrappedMorph.$.type;
                      if (partOfSpeech === 'prefix') {
                        tierValue = tierValue + '-';
                      } else if (partOfSpeech === 'suffix') {
                        tierValue = '-' + tierValue;
                      }
                    }

                  }

                  // process.stdout.write(tierValue + " "); // for debugging
                  if (!morphsToGlom.hasOwnProperty(tierID)) {
                    morphsToGlom[tierID] = {};
                  }
                  morphsToGlom[tierID][slotNum] = {
                    "value": tierValue
                  };
                }
              }
              slotNum++;
            }

            for (const tierID in morphsToGlom) {
              if (morphsToGlom.hasOwnProperty(tierID)) {
                let glommedValue = '';
                let maybeAddSeparator = false; // never add a separator before first word
                for (let i = wordStartSlot; i < slotNum; i++) {
                  let nextValue = '***';
                  if (morphsToGlom[tierID][i] != null) {
                    nextValue = morphsToGlom[tierID][i]["value"];
                  }

                  // insert compound separator if needed
                  if (maybeAddSeparator && !isSeparator(nextValue.substring(0, 1))) {
                    glommedValue += '+';
                  }
                  if (!isSeparator(nextValue.substring(-1))) {
                    maybeAddSeparator = true;
                  }

                  glommedValue += nextValue;
                }
                // tierID -> start_slot -> {"value": value, "end_slot": end_slot}
                if (!glommedMorphs.hasOwnProperty(tierID)) {
                  glommedMorphs[tierID] = {};
                }
                glommedMorphs[tierID][wordStartSlot] = {
                  "value": glommedValue,
                  "end_slot": slotNum
                };
              }
            }
          } else if (wordWithMorphs.item[0].$.type !== "punct") {
            // if a non-punctuation word has no morphs, it still takes up a slot
            slotNum++;
          }

          if (wordWithMorphs.item[0].$.type !== "punct") { // this word isn't punctuation
            sentenceTokens.push({"value": wordValue, "type": "txt"});

            // count this as a separate word on the words tier
            glommedMorphs[wordsTierID][wordStartSlot] = {
              "value": wordValue,
              "end_slot": slotNum
            };
          } else if (isStartPunctuation(wordValue)) {
            sentenceTokens.push({"value": wordValue, "type": "start"});
          } else { // end punctuation
            sentenceTokens.push({"value": wordValue, "type": "end"});
          }
        }

        const freeGlosses = wrappedSentence.item;
        let glossStartSlot = 0;
        for (const gloss of freeGlosses) {
          if (gloss.$.type === "gls") {
            const glossValue = gloss._;
            if (glossValue != null) {
              // console.log(glossValue); // for debugging
              const tierID = tierReg.maybeRegisterTier(gloss.$.lang, "free", false);
              if (tierID != null) {
                if (!glommedMorphs.hasOwnProperty(tierID)) {
                  glommedMorphs[tierID] = {};
                }
                glommedMorphs[tierID][glossStartSlot] = {
                  "value": glossValue,
                  "end_slot": slotNum
                };
              }
            } // else there's not actually a gloss here, just the metadata/placeholder for one
          } // else it might be type "segnum" (sentence number) or similar; we'll ignore it
        }

        const dependentsJson = [];
        for (const tierID in glommedMorphs) {
          if (glommedMorphs.hasOwnProperty(tierID)) {
            const valuesJson = [];
            for (const start_slot in glommedMorphs[tierID]) {
              if (glommedMorphs[tierID].hasOwnProperty(start_slot)) {
                valuesJson.push({
                  "start_slot": parseInt(start_slot, 10),
                  "end_slot": glommedMorphs[tierID][start_slot]["end_slot"],
                  "value": glommedMorphs[tierID][start_slot]["value"]
                })
              }
            }
            dependentsJson.push({
              "tier": tierID,
              "values": valuesJson
            });
          }
        }

        let sentenceText = "";
        let maybeAddSpace = false; // no space before first word
        for (const typedToken of sentenceTokens) {
          if (maybeAddSpace && (typedToken.type !== "end")) {
            sentenceText += " ";
          }
          maybeAddSpace = (typedToken.type !== "start");
          sentenceText += typedToken["value"];
        }

        // "speaker, "start_time", and "end_time" omitted (they're only used on elan files)
        jsonOut.sentences.push({
          "num_slots": slotNum,
          "text": sentenceText,
          "dependents": dependentsJson
        });
      }
    }

    const prettyString = JSON.stringify(jsonOut, null, 2);
    fs.writeFile(jsonFileName, prettyString, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("✅  Correctly processed " + shortFileName + ".xml");
      if (callback != null) {
        callback();
      }
    });
  });
}

function preprocess_dir(xmlFilesDir, jsonFilesDir, isoFileName, callback) {
  let isoDict = {};
  try {
    isoDict = JSON.parse(fs.readFileSync(isoFileName));
  } catch (err) {
    console.log("Unable to read ISO codes file. Error was " + err + " Proceeding anyway...");
  }

  const xmlFileNames = fs.readdirSync(xmlFilesDir).filter(f => f[0] !== '.'); // excludes hidden files

  // use this to wait for all preprocess calls to terminate before executing the callback
  const status = {numJobs: xmlFileNames.length};
  const whenDone = function () {
    status.numJobs--;
    if (status.numJobs === 0) {
      callback();
    }
  };

  for (const xmlFileName of xmlFileNames) {
    // console.log("Processing " + xmlFileName);
    const xmlPath = xmlFilesDir + xmlFileName;
    const jsonPath = jsonFilesDir + xmlFileName.slice(0, -4) + ".json";
    preprocess(xmlPath, jsonPath, xmlFileName.slice(0, -4), isoDict, whenDone);
  }
}

module.exports = {
  preprocess_dir: preprocess_dir
};
