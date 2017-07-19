/* Assumes all morphemes within a document have the same set of "tiers" (i.e. language and type combinations, like english gloss) in the same order. */

var fs = require('fs');
var util = require('util');
var parseString = require('xml2js').parseString; // or we could use simple-xml

var fileName = process.argv[2];
// var basePath = "C:\\Users\\Kalinda\\Documents\\GitHub\\Korpus\\";
var basePath = "../";
// var startJsonFileName = basePath + "data\\json_files\\001_temp.json" // only for debugging
var xmlFileName = basePath + "data/flex_files/" + fileName + ".xml";
var jsonFileName = basePath + "data/json_files/" + fileName + ".json";
var indexJsonFileName = basePath + "data/index.json"; // stores metadata for all documents
var isoFileName = basePath + "preprocessing/iso_dict.json";

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
  
  isoDict = {};
  fs.readFile(isoFileName, function(err, value) {
    if (err) {
      console.log("Unable to read ISO codes file. Proceeding anyway...");
    }
    isoDict = JSON.parse(value);
    
    parseString(xml, function (err, jsonIn) {

      // TITLE STUFF - NICK
      var con_title = "";
      var es_title = "";
      var titles = jsonIn["document"]["interlinear-text"][0]["item"];
      for (var i=0; i<titles.length; i++) {
        var current_title = titles[i];
        if (current_title["$"]["type"] == "title" && current_title["$"]["lang"] == "con-Latn-EC") {
          con_title = current_title["_"].substr(current_title["_"].indexOf(" ") + 1);
        }
        else if (current_title["$"]["type"] == "title" && current_title["$"]["lang"] == "es") {
          es_title = current_title["_"]
        }
      }
      if (es_title != "") {
        var display_title = con_title + " (" + es_title + ")";
      }
      else {
        var display_title = con_title;
      }

      jsonOut.metadata.title = con_title;
      // END OF TITLE STUFF
      
      /* // for debugging, it's sometimes useful to look at jsonIn before doing anything with it
      var prettyStringIn = JSON.stringify(jsonIn, null, 2);
      fs.writeFile(startJsonFileName, prettyStringIn, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("JSON of input file saved.");
      }); */
      
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
      var wordsTierID = maybeRegisterTier(textLang, "words");
      
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
          console.log("The converted file was saved.");
      }); 
      
      // TODO create indexfile if needed
      // TODO avoid duplicates
      fs.readFile(indexJsonFileName, function (err, rawText) {
        if (err) {
          return console.log(err);
        }
        var index = JSON.parse(rawText);
        var indexMetadata = {"title from filename": title, "display_title": display_title};
        index.push(indexMetadata);
        var prettyString2 = JSON.stringify(index, null, 2);
        fs.writeFile(indexJsonFileName, prettyString2, function(err) {
          if (err) {
            return console.log(err);
          }
          console.log("The index was updated.");
        });
      });     
    });
  });
});

