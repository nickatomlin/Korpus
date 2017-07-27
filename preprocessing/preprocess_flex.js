var fs = require('fs');
var util = require('util');
var parseXml = require('xml2js').parseString; // or we could use simple-xml


function isStartPunctuation(punct) {
    return (punct == "¿") || (punct == "(");
}

function decodeLang(lang) {

    var desiredName = "Native name"; // or we might want to use "ISO language name"
    lcLang = lang.toLowerCase(); // ignore capitalization when decoding

    // Override the usual iso-based decoding for some language codes
    switch(lang) {
        // case "flex-language-name-here": return "desired-decoded-name-here";
        case "con-Latn-EC": return "A'ingae";
        case "defaultLang": return "defaultLang";

        // for Spanish UI text:
        case "en": return "Inglés";

        default: // fall through
    }

    // if lang is an iso code, decode it
    if (isoDict.hasOwnProperty(lcLang)) {
        return isoDict[lcLang][desiredName];
    }

    // if lang starts with a (three-letter or two-letter) iso code, decode it
    var firstThreeLetters = lcLang.substr(0, 3);
    if (isoDict.hasOwnProperty(firstThreeLetters)) {
        return isoDict[firstThreeLetters][desiredName];
    }
    var firstTwoLetters = lcLang.substr(0, 2);
    if (isoDict.hasOwnProperty(firstTwoLetters)) {
        return isoDict[firstTwoLetters][desiredName];
    }

    // as a last resort, return without decoding
    return lang;
}

function decodeType(type) {
    /*
    // English UI text:
      switch(type) {
          case "txt": return "morpheme (text)";
          case "cf": return "morpheme (citation form)";
          case "gls": return "morpheme gloss"
          case "msa": return "part of speech";
      default: return type;
      }
    */

    // Spanish UI text:
    switch(type) {
        case "txt": return "Morfema (texto)";
        case "cf": return "Morfema (forma típico)";
        case "gls": return "Glosa de morfema"
        case "msa": return "Parte del habla";
        case "words": return "Palabra";
        case "free": return "Frase";
        default: return type;
    }
}

function getTierName(lang, type) {
    /*
    // English UI text:
      return decodeLang(lang) + " " + decodeType(type);
    */

    // Spanish UI text:
    return decodeType(type) + " " + decodeLang(lang).toLowerCase();
}

class tierRegistry {

    constructor(tierIDs, jsonTierIDs) {
        this.tierIDs = tierIDs;
        this.jsonTierIDs = jsonTierIDs;
        this.nextTierIDnum = 1;
    }

    // if this is a new tier, register its ID and include it in metadata
    // used global vars: tierIDs, jsonOut.metadata["tier IDs"], nextTierIDnum
    maybeRegisterTier(lang, type) {
        if (!this.tierIDs.hasOwnProperty(lang)) {
            this.tierIDs[lang] = {};
        }
        if (!this.tierIDs[lang].hasOwnProperty(type)) {
            var tierID = "T" + (this.nextTierIDnum++).toString();
            this.tierIDs[lang][type] = tierID;
            this.jsonTierIDs[tierID] = getTierName(lang, type);
        }
        return this.tierIDs[lang][type];
    }

}

function preprocess(xmlFileName, jsonFileName) {
    var jsonOut = {
        "metadata": {
            "tier IDs": {},
            "title": "",
            "timed": "false"
            // "speaker IDs" omitted (only used on elan files)
        },
        "sentences": []
    };
    var tierReg = new tierRegistry({}, jsonOut.metadata["tier IDs"]);

    parseXml(fs.readFileSync(xmlFileName), function(err, jsonIn){
        if (err) throw err;

        // TITLE STUFF - NICK
        var title = xmlFileName.substr(xmlFileName.lastIndexOf('/') + 1); // hides path to file name
        title = title.slice(0,-4); // removes last four characters

        var con_title = "";
        var es_title = "";
        var titles = jsonIn["document"]["interlinear-text"][0]["item"];
        for (var i=0; i<titles.length; i++) {
            var current_title = titles[i];
            if (current_title["$"]["type"] == "title" && current_title["$"]["lang"] == "con-Latn-EC") {
                // FIXME: This line causes Singo A'i to show up with title "a'i". Why is this even here?
                con_title = current_title["_"].substr(current_title["_"].indexOf(" ") + 1);
            }
            else if (current_title["$"]["type"] == "title" && current_title["$"]["lang"] == "es") {
                es_title = current_title["_"]
            }
        }
        if (es_title != "") {
            var display_title = con_title + " (" + es_title + ")";
        } else {
            var display_title = con_title;
        }

        jsonOut.metadata.title = con_title;
        // END OF TITLE STUFF

        var textLang;
        // set textLang to the language of the first word
        var paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph;
        var paragraph = paragraphs[0].phrases[0].word;
        var sentence = paragraph[0].words[0].word;
        var wordLang = sentence[0].item[0].$.lang;
        textLang = wordLang;
        if (textLang == null) {
            textLang = "defaultLang";
        }

        var languages = jsonIn["document"]["interlinear-text"][0].languages[0].language;
        var wordsTierID = tierReg.maybeRegisterTier(textLang, "words");

        // var paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph; // defined above
        for (var wrappedParagraph of paragraphs) {
            if (wrappedParagraph.phrases == null) continue; // if this paragraph is empty, skip it instead of erroring
            var paragraph = wrappedParagraph.phrases[0].word;
            for (var wrappedSentence of paragraph) {
                if (wrappedSentence.words == null) continue; // if this sentence is empty, skip it instead of erroring
                var sentence = wrappedSentence.words[0].word;

                var morphsJson = {}; // tierID -> start_slot -> {"value": value, "end_slot": end_slot}
                morphsJson[wordsTierID] = {};
                var slotNum = 0;
                var sentenceTokens = []; // for building the free transcription sentenceText
                // FIXME words tier will show up even when the sentence is empty of words

                for (var wordWithMorphs of sentence) {
                    var wordValue = wordWithMorphs.item[0]._;
                    var wordStartSlot = slotNum;
                    // process.stdout.write("\n" + wordValue + " "); // for debugging

                    if (wordWithMorphs.morphemes != null) {
                        var morphs = wordWithMorphs.morphemes[0].morph;
                        for (var wrappedMorph of morphs) {
                            var morphTiers = wrappedMorph.item;
                            for (var tier of morphTiers) {
                                // record the morph's value so it can be included in the output
                                var tierID = tierReg.maybeRegisterTier(tier.$.lang, tier.$.type);
                                var tierValue = tier._;
                                // process.stdout.write(tierValue + " "); // for debugging
                                if (!morphsJson.hasOwnProperty(tierID)) {
                                    morphsJson[tierID] = {};
                                }
                                morphsJson[tierID][slotNum] = {
                                    "value": tierValue,
                                    "end_slot": slotNum + 1
                                };
                            }
                            slotNum++;
                        }
                    }

                    if (wordWithMorphs.item[0].$.type != "punct") { // this word isn't punctuation

                        sentenceTokens.push({"value": wordValue, "type": "txt"});

                        // count this as a separate word on the words tier
                        var wordEndSlot = slotNum;
                        morphsJson[wordsTierID][wordStartSlot] = {
                            "value": wordValue,
                            "end_slot": wordEndSlot
                        };
                    } else if (isStartPunctuation(wordValue)) {
                        sentenceTokens.push({"value": wordValue, "type": "start"});
                    } else { // end punctuation
                        sentenceTokens.push({"value": wordValue, "type": "end"});
                    }
                }

                var freeGlosses = wrappedSentence.item;
                var glossStartSlot = 0;
                for (var gloss of freeGlosses) {
                    if (gloss.$.type == "gls") {
                        var glossValue = gloss._;
                        if (glossValue != null) {
                            // console.log(glossValue); // for debugging
                            var tierID = tierReg.maybeRegisterTier(gloss.$.lang, "free");
                            if (!morphsJson.hasOwnProperty(tierID)) {
                                morphsJson[tierID] = {};
                            }
                            morphsJson[tierID][glossStartSlot] = {
                                "value": glossValue,
                                "end_slot": slotNum
                            };
                        } // else there's not actually a gloss here, just the metadata/placeholder for one
                    } // else it might be type "segnum" (sentence number) or similar; we'll ignore it
                }

                var dependentsJson = [];
                for (var tierID in morphsJson) {
                    if (morphsJson.hasOwnProperty(tierID)) {
                        var valuesJson = [];
                        for (var start_slot in morphsJson[tierID]) {
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

                var sentenceText = "";
                var maybeAddSpace = false; // no space before first word
                for (typedToken of sentenceTokens) {
                    if (maybeAddSpace && (typedToken.type != "end")) {
                        sentenceText += " ";
                    }
                    maybeAddSpace = (typedToken.type != "start");
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

        var prettyString = JSON.stringify(jsonOut, null, 2);
        fs.writeFile(jsonFileName, prettyString, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The converted file " + jsonFileName + " was saved.");
        });

        // TODO avoid duplicates
        var indexMetadata = {"title from filename": title, "display_title": display_title};
        index.push(indexMetadata);
    });
}

// var basePath = "C:\\Users\\Kalinda\\Desktop\\Korpus\\";
var basePath = "../";
var xmlFilesDir = basePath + "data/flex_files/";
var jsonFilesDir = basePath + "data/json_files/";
indexJsonFileName = basePath + "data/index.json"; // stores metadata for all documents
isoFileName = basePath + "preprocessing/iso_dict.json";

var isoDict = {};
try {
    isoDict = JSON.parse(fs.readFileSync(isoFileName));
} catch(err) {
    console.log("Unable to read ISO codes file. Error was " + err + " Proceeding anyway...");
}

// TODO create indexfile if needed
index = JSON.parse(fs.readFileSync(indexJsonFileName));

var xmlFileNames = fs.readdirSync(xmlFilesDir);
for (var xmlFileName of xmlFileNames) {
    console.log("Processing " + xmlFileName);
    var xmlPath = xmlFilesDir + xmlFileName;
    var jsonPath = jsonFilesDir + xmlFileName.slice(0,-4) + ".json";
    preprocess(xmlPath, jsonPath);
}

var indexPrettyString = JSON.stringify(index, null, 2);
fs.writeFileSync(indexJsonFileName, indexPrettyString);
console.log("The index was updated.");
