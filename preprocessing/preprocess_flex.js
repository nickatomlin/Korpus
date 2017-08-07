/* Run this script from the main directory (Korpus) */

const fs = require('fs');
const util = require('util');
const parseXml = require('xml2js').parseString; // or we could use simple-xml
const tierRegistry = require('./tier_registry').tierRegistry;


function isStartPunctuation(punct) {
    return (punct === "¿") || (punct === "(");
}

function preprocess(xmlFileName, jsonFileName, shortFileName, isoDict) {
    const jsonOut = {
        "metadata": {
            "title from filename": shortFileName,
            "tier IDs": {},
            "title": "",
            "timed": "false"
            // "speaker IDs" omitted (only used on elan files)
        },
        "sentences": []
    };
    const tierReg = new tierRegistry({}, jsonOut.metadata["tier IDs"], isoDict);

    parseXml(fs.readFileSync(xmlFileName), function(err, jsonIn){
        if (err) throw err;

        const titles = jsonIn["document"]["interlinear-text"][0]["item"];
        for (const current_title of titles) {
            if (current_title['$']['type'] === 'title' && current_title["$"]["lang"] === "con-Latn-EC") {
                jsonOut.metadata.title = current_title["_"].substr(current_title["_"].indexOf(" ") + 1);
            }
        }

        // set textLang to the language of the first word
        const paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph;
        const paragraph = paragraphs[0].phrases[0].word;
        const sentence = paragraph[0].words[0].word;
        const wordLang = sentence[0].item[0].$.lang;
        let textLang = wordLang;
        if (textLang === null) {
            textLang = "defaultLang";
        }

        const languages = jsonIn["document"]["interlinear-text"][0].languages[0].language;
        const wordsTierID = tierReg.maybeRegisterTier(textLang, "words");

        // const paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph; // defined above
        for (const wrappedParagraph of paragraphs) {
            if (wrappedParagraph.phrases == null) continue; // if this paragraph is empty, skip it instead of erroring
            const paragraph = wrappedParagraph.phrases[0].word;
            for (const wrappedSentence of paragraph) {
                if (wrappedSentence.words == null) continue; // if this sentence is empty, skip it instead of erroring
                const sentence = wrappedSentence.words[0].word;

                const morphsJson = {}; // tierID -> start_slot -> {"value": value, "end_slot": end_slot}
                morphsJson[wordsTierID] = {};
                let slotNum = 0;
                const sentenceTokens = []; // for building the free transcription sentenceText
                // FIXME words tier will show up even when the sentence is empty of words

                for (const wordWithMorphs of sentence) {
                    const wordValue = wordWithMorphs.item[0]._;
                    const wordStartSlot = slotNum;
                    // process.stdout.write("\n" + wordValue + " "); // for debugging

                    if (wordWithMorphs.morphemes != null) {
                        const morphs = wordWithMorphs.morphemes[0].morph;
                        for (const wrappedMorph of morphs) {
                            const morphTiers = wrappedMorph.item;
                            for (const tier of morphTiers) {
                                // record the morph's value so it can be included in the output
                                const tierID = tierReg.maybeRegisterTier(tier.$.lang, tier.$.type);
                                if (tierID != null) {
                                    const tierValue = tier._;
                                    // process.stdout.write(tierValue + " "); // for debugging
                                    if (!morphsJson.hasOwnProperty(tierID)) {
                                        morphsJson[tierID] = {};
                                    }
                                    morphsJson[tierID][slotNum] = {
                                        "value": tierValue,
                                        "end_slot": slotNum + 1
                                    };
                                }
                            }
                            slotNum++;
                        }
                    }

                    if (wordWithMorphs.item[0].$.type !== "punct") { // this word isn't punctuation
                        sentenceTokens.push({"value": wordValue, "type": "txt"});

                        // count this as a separate word on the words tier
                        morphsJson[wordsTierID][wordStartSlot] = {
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
                            const tierID = tierReg.maybeRegisterTier(gloss.$.lang, "free");
                            if (tierID != null) {
                                if (!morphsJson.hasOwnProperty(tierID)) {
                                    morphsJson[tierID] = {};
                                }
                                morphsJson[tierID][glossStartSlot] = {
                                    "value": glossValue,
                                    "end_slot": slotNum
                                };
                            }
                        } // else there's not actually a gloss here, just the metadata/placeholder for one
                    } // else it might be type "segnum" (sentence number) or similar; we'll ignore it
                }

                const dependentsJson = [];
                for (const tierID in morphsJson) {
                    if (morphsJson.hasOwnProperty(tierID)) {
                        const valuesJson = [];
                        for (const start_slot in morphsJson[tierID]) {
                            if (morphsJson[tierID].hasOwnProperty(start_slot)) {
                                valuesJson.push({
                                    "start_slot": parseInt(start_slot, 10),
                                    "end_slot": morphsJson[tierID][start_slot].end_slot,
                                    "value": morphsJson[tierID][start_slot].value
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
                for (typedToken of sentenceTokens) {
                    if (maybeAddSpace && (typedToken.type !== "end")) {
                        sentenceText += " ";
                    }
                    maybeAddSpace = (typedToken.type !== "start");
                    sentenceText += typedToken.value;
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
        fs.writeFile(jsonFileName, prettyString, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The converted file " + jsonFileName + " was saved.");
        });
    });
}

function preprocess_dir(xmlFilesDir, jsonFilesDir, isoFileName) {
    let isoDict = {};
    try {
        isoDict = JSON.parse(fs.readFileSync(isoFileName));
    } catch (err) {
        console.log("Unable to read ISO codes file. Error was " + err + " Proceeding anyway...");
    }

    const xmlFileNames = fs.readdirSync(xmlFilesDir);
    for (const xmlFileName of xmlFileNames) {
        console.log("Processing " + xmlFileName);
        const xmlPath = xmlFilesDir + xmlFileName;
        const jsonPath = jsonFilesDir + xmlFileName.slice(0, -4) + ".json";
        preprocess(xmlPath, jsonPath, xmlFileName.slice(0, -4), isoDict);
    }
}

module.exports = {
    preprocess_dir: preprocess_dir
};
