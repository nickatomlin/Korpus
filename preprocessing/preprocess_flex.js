/* Assumes all morphemes within a document have the same set of "tiers" (i.e. language and type combinations, like english gloss) in the same order. */

var fs = require('fs');
var util = require('util');
var parseString = require('xml2js').parseString; // or we could use simple-xml
  
// var basePath = "C:\\Users\\Kalinda\\Documents\\GitHub\\Korpus\\";
var basePath = "../";
// var startJsonFileName = basePath + "data/json_files/singo_ai_temp.json" // only for debugging
var xmlFileName = basePath + "data/flex_files/singo_ai.xml";
var jsonFileName = basePath + "data/json_files/singo_ai.json";
var indexJsonFileName = basePath + "data/json_files/index.json"; // stores metadata for all documents
var isoFileName = basePath + "/preprocessing/iso_dict.json";

function decodeLang(lang) {
  var desiredName = "Native name"; // or we might want to use "ISO language name"
  lcLang = lang.toLowerCase(); // ignore capitalization when decoding
  
  // Override the usual iso-based decoding for some language codes
  switch(lang) {
    // case "flex-language-name-here": return "desired-decoded-name-here";
		case "con-Latn-EC": return "A'ingae";
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
	switch(type) {
		case "txt": return "morpheme (text)";
		case "cf": return "morpheme (citation form)";
		case "gls": return "morpheme gloss"
		case "msa": return "part of speech";
		default: return type;
	}
}

function getTierName(lang, type) {
	return decodeLang(lang) + " " + decodeType(type);
}

// if this is a new tier, register its ID and include it in metadata
function maybeRegisterTier(lang, type) {
	if (!tierIDs.hasOwnProperty(lang)) {
		tierIDs[lang] = {};
	}
	if (!tierIDs[lang].hasOwnProperty(type)) {
		var tierID = "T" + (nextTierIDnum++).toString();
		tierIDs[lang][type] = tierID;
		jsonOut.metadata["tier IDs"][tierID] = getTierName(lang, type);
	}
	return tierIDs[lang][type];
}

nextTierIDnum = 1;
tierIDs = {};
jsonOut = {
	"metadata": {
		"tier IDs": {},
		"title": "",
    "timed": "false"
		// "speaker IDs" omitted (only used on elan files)
		},
	"sentences": []
};

fs.readFile(xmlFileName, function (err, xml) {
  if (err) throw err;

	var title = xmlFileName.substr(xmlFileName.lastIndexOf('/') + 1); // hides path to file name
	title = title.slice(0,-4); // removes last four characters
	jsonOut.metadata.title = title; // sets title
  
  isoDict = {};
  fs.readFile(isoFileName, function(err, value) {
    if (err) {
      console.log("Unable to read ISO codes file. Proceeding anyway...");
    }
    isoDict = JSON.parse(value);
    
    parseString(xml, function (err, jsonIn) {
      
      /* for debugging, it's sometimes useful to look at jsonIn before doing anything with it
      var prettyStringIn = JSON.stringify(jsonIn, null, 2);
      fs.writeFile(startJsonFileName, prettyStringIn, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("JSON of input file saved.");
      }); 
      */
      
      var textLang = "defaultLang"; 
      var languages = jsonIn["document"]["interlinear-text"][0].languages[0].language;
      for (var lang of languages) {
        if (lang.$.vernacular) {
          textLang = lang.$.lang;
        }
      }
      var wordsTierID = maybeRegisterTier(textLang, "words");
      
      var paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph;
      for (var wrappedParagraph of paragraphs) {
        var paragraph = wrappedParagraph.phrases[0].word;
        for (var wrappedSentence of paragraph) {
          var sentence = wrappedSentence.words[0].word;
          
          var morphsJson = {}; // tierID -> start_slot -> {"value": value, "end_slot": end_slot}
          morphsJson[wordsTierID] = {};
          var slotNum = 0;
          var sentenceText = "";
          // FIXME words tier will show up even when the sentence is empty of words
          
          for (var wordWithMorphs of sentence) {
            var wordValue = wordWithMorphs.item[0]._;
            var wordStartSlot = slotNum;
            // process.stdout.write("\n" + wordValue + " "); // for debugging
            
            if (wordWithMorphs.morphemes != null) {
              // write a space before every non-punctuation word other than the first word
              if (sentenceText != "") {
                sentenceText += " "; 
              }
              
              var morphs = wordWithMorphs.morphemes[0].morph;
              for (var wrappedMorph of morphs) {
                var morphTiers = wrappedMorph.item;
                for (var tier of morphTiers) {
                  // record the morph's value so it can be included in the output
                  var tierID = maybeRegisterTier(tier.$.lang, tier.$.type);
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
              
              var wordEndSlot = slotNum;
              morphsJson[wordsTierID][wordStartSlot] = {
                "value": wordValue, 
                "end_slot": wordEndSlot
              };
            } // else the "word" is probably just punctuation; include it only on the sentence tier
            sentenceText += wordValue;
          }
          
          var freeGlosses = wrappedSentence.item;
          var glossStartSlot = 0;
          for (var gloss of freeGlosses) {
            if (gloss.$.type == "gls") {
              var glossValue = gloss._;
              if (glossValue != null) {
                // console.log(glossValue); // for debugging
                var tierID = maybeRegisterTier(gloss.$.lang, "free");
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
          console.log("The converted file was saved.");
      }); 
      
      /*
      // TODO create indexfile if needed
      // TODO avoid duplicates
      fs.readFile(indexJsonFileName, function (err, rawText) {
        if (err) {
          return console.log(err);
        }
        var index = JSON.parse(rawText);
        var indexMetadata = {"title from filename": title};
        index.push(indexMetadata);
        var prettyString2 = JSON.stringify(index, null, 2);
        fs.writeFile(indexJsonFileName, prettyString2, function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The index was updated.");
        });
      });
*/      
    });
  });
});

