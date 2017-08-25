/* Run this script from the main directory (Korpus) */

const fs = require('fs');
const util = require('util');
const parseXml = require('xml2js').parseString; // or we could use simple-xml
const tierRegistry = require('./tier_registry').tierRegistry;
const helper = require('./helper_functions');
const flexUtils = require('./flex_utils');

function isStartPunctuation(punct) {
  return (punct === "¿") || (punct === "(");
}

function isSeparator(char) {
  return (char === "-") || (char === "=") || (char === "~");
}

function isPunctuation(word) {
  return word.item[0].$.type === "punct";
}

function updateIndex(metadata, indexFileName, storyID) {
  let index = JSON.parse(fs.readFileSync(indexFileName, "utf8"));
  index[storyID] = metadata;
  fs.writeFileSync(indexFileName, JSON.stringify(index, null, 2));
}

function getGlommedValue(morphsThisTier, wordStartSlot, wordEndSlot) {
  let glommedValue = '';
  let maybeAddCompoundSeparator = false; // never add a separator before the first word
  for (let i = wordStartSlot; i < wordEndSlot; i++) {
    let nextValue = '***';
    if (morphsThisTier[i] != null) {
      nextValue = morphsThisTier[i]["value"];

      // insert missing '-' if needed (FLEX seems to omit them in glosses of affixes)
      if (morphsThisTier[i]["tier type"] === 'gls') {
        if (morphsThisTier[i]["part of speech"] === 'prefix') {
          nextValue = nextValue + '-';
        } else if (morphsThisTier[i]["part of speech"] === 'suffix') {
          nextValue = '-' + nextValue;
        }
      }
    }

    // insert compound-word separator if needed
    if (maybeAddCompoundSeparator && !isSeparator(nextValue.substring(0, 1))) {
      glommedValue += '+';
    }
    if (!isSeparator(nextValue.substring(-1))) {
      maybeAddCompoundSeparator = true;
    }

    glommedValue += nextValue;
  }

  return glommedValue;
}

function getSentenceToken(word) {
  const wordValue = flexUtils.getWordValue(word);

  let type = 'txt';
  if (isPunctuation(word)) {
    if (isStartPunctuation(wordValue)) {
      type = 'start';
    } else {
      type = 'end';
    }
  }

  return {'value': wordValue, 'type': type};
}

function getSentenceText(sentenceTokens) {
  let sentenceText = "";
  let maybeAddSpace = false; // no space before first word
  for (const typedToken of sentenceTokens) {
    if (maybeAddSpace && (typedToken.type !== "end")) {
      sentenceText += " ";
    }
    maybeAddSpace = (typedToken.type !== "start");
    sentenceText += typedToken["value"];
  }
  return sentenceText;
}

function getDependentsJson(morphsJson) {
  const dependentsJson = [];
  for (const tierID in morphsJson) {
    if (morphsJson.hasOwnProperty(tierID)) {
      const valuesJson = [];
      for (const start_slot in morphsJson[tierID]) {
        if (morphsJson[tierID].hasOwnProperty(start_slot)) {
          valuesJson.push({
            "start_slot": parseInt(start_slot, 10),
            "end_slot": morphsJson[tierID][start_slot]["end_slot"],
            "value": morphsJson[tierID][start_slot]["value"]
          })
        }
      }
      dependentsJson.push({
        "tier": tierID,
        "values": valuesJson
      });
    }
  }
  return dependentsJson;
}

function repackageMorphs(morphs, tierReg, startSlot) {
  // FLEx packages morph items by morpheme, not by type.
  // We handle this by first re-packaging all the morphs by type(a.k.a. tier),
  // then concatenating(a.k.a. glomming) all the morphs of the same type.

  // Repackaging step:
  const morphTokens = {};
  let slotNum = startSlot;
  for (const morph of morphs) {
    for (const tier of flexUtils.getMorphTiers(morph)) {
      const tierID = tierReg.maybeRegisterTier(tier.$.lang, tier.$.type, true);
      if (tierID != null) {
        if (!morphTokens.hasOwnProperty(tierID)) {
          morphTokens[tierID] = {};
        }
        morphTokens[tierID][slotNum] = {
          "value": flexUtils.getMorphTierValue(tier),
          "tier type": tier.$.type,
          "part of speech": flexUtils.getMorphPartOfSpeech(morph),
        };
      }
    }
    slotNum++;
  }

  // Concatenating step:
  let morphsJson = {};
  for (const tierID in morphTokens) {
    if (morphTokens.hasOwnProperty(tierID)) {
      if (!morphsJson.hasOwnProperty(tierID)) {
        morphsJson[tierID] = {};
      }
      morphsJson[tierID][startSlot] = {
        "value": getGlommedValue(morphTokens[tierID], startSlot, slotNum),
        "end_slot": slotNum
      };
    }
  }

  return morphsJson;
}

// dest - an object with all its values nested two layers deep
// src - an object with all its values nested two layers deep
// inserts all values of src into dest, preserving their inner and outer keys,
// while retaining all values of dest except those that directly conflict with src
function mergeTwoLayerDict(dest, src) {
  for (const outerProp in src) {
    if (src.hasOwnProperty(outerProp)) {
      if (!dest.hasOwnProperty(outerProp)) {
        dest[outerProp] = {};
      }
      for (const innerProp in src[outerProp]) {
        if (src[outerProp].hasOwnProperty(innerProp)) {
          dest[outerProp][innerProp] = src[outerProp][innerProp]; // overwrites dest[outerProp][innerProp]
        }
      }
    }
  }
}

function repackageFreeGlosses(freeGlosses, tierReg, endSlot) {
  const glossStartSlot = 0;
  const morphsJson = {};
  for (const gloss of freeGlosses) {
    const tierID = tierReg.maybeRegisterTier(gloss.$.lang, "free", false);
    if (tierID != null) {
      if (!morphsJson.hasOwnProperty(tierID)) {
        morphsJson[tierID] = {};
      }
      morphsJson[tierID][glossStartSlot] = {
        "value": flexUtils.getFreeGlossValue(gloss),
        "end_slot": endSlot
      };
    }
  }
  return morphsJson;
}

function getSentenceJson(sentence, tierReg, wordsTierID) {
  const morphsJson = {}; // tierID -> start_slot -> {"value": value, "end_slot": end_slot}
  morphsJson[wordsTierID] = {}; // FIXME words tier will show up even when the sentence is empty of words

  let slotNum = 0;
  const sentenceTokens = []; // for building the free transcription
  for (const word of flexUtils.getSentenceWords(sentence)) {
    const wordStartSlot = slotNum;

    // deal with the morphs that subdivide this word
    const morphs = flexUtils.getWordMorphs(word);
    const newMorphsJson = repackageMorphs(morphs, tierReg, slotNum);
    mergeTwoLayerDict(morphsJson, newMorphsJson);
    slotNum += morphs.length;
    if (morphs.length === 0 && !isPunctuation(word)) {
      slotNum++; // if a non-punctuation word has no morphs, it still takes up a slot
    }

    // deal with the word itself
    if (!isPunctuation(word)) {
      // count this as a separate word on the words tier
      morphsJson[wordsTierID][wordStartSlot] = {
        "value": flexUtils.getWordValue(word),
        "end_slot": slotNum
      };
    }

    // deal with sentence-level transcription
    sentenceTokens.push(getSentenceToken(word));
  }

  // deal with free glosses
  const freeGlosses = flexUtils.getSentenceFreeGlosses(sentence);
  const freeGlossesJson = repackageFreeGlosses(freeGlosses, tierReg, slotNum);
  mergeTwoLayerDict(morphsJson, freeGlossesJson);

  // "speaker, "start_time", and "end_time" omitted (they're only used on elan files)
  return ({
    "num_slots": slotNum,
    "text": getSentenceText(sentenceTokens),
    "dependents": getDependentsJson(morphsJson),
  });
}

function preprocessText(jsonIn, jsonFilesDir, shortFileName, isoDict, callback) {
  let storyID = jsonIn.$.guid;

  let metadata = helper.improveFLExIndexData(storyID, jsonIn);
  updateIndex(metadata, "data/index2.json", storyID);

  const jsonOut = {
    "metadata": metadata,
    "sentences": []
  };

  let textLang = flexUtils.getWordLang(flexUtils.getDocumentFirstWord(jsonIn));
  const tierReg = new tierRegistry(isoDict);
  const wordsTierID = tierReg.maybeRegisterTier(textLang, "words", true);

  for (const paragraph of flexUtils.getDocumentParagraphs(jsonIn)) {
    for (const sentence of flexUtils.getParagraphSentences(paragraph)) {
      jsonOut.sentences.push(getSentenceJson(sentence, tierReg, wordsTierID));
    }
  }

  jsonOut.metadata['tier IDs'] = tierReg.getTiersJson();

  const prettyString = JSON.stringify(jsonOut, null, 2);
  const jsonPath = jsonFilesDir + storyID + ".json";
  fs.writeFile(jsonPath, prettyString, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("✅  Correctly wrote " + storyID + ".json");
      if (callback != null) {
        callback();
      }
    }
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
    fs.readFile(xmlPath, function (err1, xmlData) {
      if (err1) throw err1;
      parseXml(xmlData, function (err2, jsonData) {
        if (err2) throw err2;
        const texts = jsonData['document']['interlinear-text'];
        for (const text of texts) {
          preprocessText(text, jsonFilesDir, xmlFileName.slice(0, -4), isoDict, whenDone);
        }
      });
    });

  }
}

module.exports = {
  preprocess_dir: preprocess_dir
};
