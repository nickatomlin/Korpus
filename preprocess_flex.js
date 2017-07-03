/* Assumes all morphemes within a document have the same set of "tiers" (i.e. language and type combinations, like english gloss) in the same order. */

var fs = require('fs');
var util = require('util');
var parseString = require('xml2js').parseString; // or we could use simple-xml
  
var xmlFileName = "C:\\Users\\Kalinda\\Documents\\MEGAsync\\Linguistics\\UTRA\\data_conversion\\singo_ai.xml";
var jsonFileName = "C:\\Users\\Kalinda\\Documents\\MEGAsync\\Linguistics\\UTRA\\data_conversion\\singo_ai_preprocessed.js"

function swapJsonKeyValues(input) {
    var output = {};
    for (var value in input) {
		if (input.hasOwnProperty(value)) {
			output[input[value]] = value;
		}
    }
    return output;
}


fs.readFile(xmlFileName, function (err, xml) {
  if (err) throw err;
  
  parseString(xml, function (err, jsonIn) {
	
	/*
	Where various info of interest is located in the FLEX file: 
	
	var metadata = jsonIn["document"]["interlinear-text"][0].item
	var cofanTitle = metadata[0]._;
	var englishTitle = metadata[1]._;
	var englishTitleType = metadata[1].$.type;
	var englishTitleLang = metadata[1].$.lang;
	
	var langs = jsonIn["document"]["interlinear-text"][0].languages[0].language;
	var cofanLangName = langs[0].$.lang;
	var cofanLangVernacular = langs[0].$.vernacular; // undefined on english and spanish
	var englishLangFont = langs[2].$.font;
	 
	// example word
	var cansefa = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph[2].phrases[0].word[2].words[0].word[7].item[0]._;
	console.log(cansefa);
	
	// example morpheme
	var faTiers = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph[2].phrases[0].word[2].words[0].word[7].morphemes[0].morph[1].item;
	console.log(faTiers);
	
	var faTxt = faTiers[0]._;
	var faCf = faTiers[1]._;
	var faGloss = faTiers[2]._;
	var faPos = faTiers[3]._;
	console.log(faTxt + " " + faCf + " " + faGloss + " " + faPos);
	var faGlossType = faTiers[2].$.type;
	var faGlossLang = faTiers[2].$.lang;
	*/
	
	var jsonOut = {
			"metadata": {
				"tier IDs": {}
				// "speaker IDs" omitted (only used on elan files)
				},
			"sentences": []
			};
	
	/* assume tiers are the same on all morphemes, and use the first morpheme to make IDs for all tiers */
	var tiers = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph[0].phrases[0].word[0].words[0].word[0].morphemes[0].morph[0].item;
	var nextTierIDnum = 1;
	jsonOut.metadata["tier IDs"]["T" + (nextTierIDnum++).toString()] = "Main";
	for (var tier of tiers) {
		var tierID = "T" + (nextTierIDnum++).toString();
		var tierLang = tier.$.lang;
		var tierType = tier.$.type;
		var tierName = tierLang + " " + tierType;
		jsonOut.metadata["tier IDs"][tierID] = tierName;
	}
	// TODO make IDs for free translation tiers
	
	var paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph;
	for (var wrappedParagraph of paragraphs) {
		var paragraph = wrappedParagraph.phrases[0].word;
		for (var wrappedSentence of paragraph) {
			var sentence = wrappedSentence.words[0].word;
			
			var dependentsJSON = [];
			var num_slots = 0;
			var sentenceText = "";
			
			for (var wordWithMorphs of sentence) {
				console.log(wordWithMorphs);
				var wordValue = wordWithMorphs.item[0]._;
				sentenceText += wordValue; 
				if (wordWithMorphs.morphemes != null) {
					sentenceText += " "; // TODO omit if next morpheme is punctuation
					var morphs = wordWithMorphs.morphemes[0].morph;
					num_slots += morphs.length;
					for (var wrappedMorph of morphs) {
						var morphTiers = wrappedMorph.item;
						for (var tier of morphTiers) {
							var tierValue = tier._;
							var tierType = tier.$.type;
							var tierLang = tier.$.lang;
						}
					}
				} else {
					// the "word" is probably just punctuation
				}
				
			}
			
			// "speaker, "start_time", and "end_time" omitted (they're only used on elan files)
			// use "num_slots" and "text"
			jsonOut.sentences.push({
				"num_slots": num_slots,
				"text": sentenceText,
				"dependents": dependentsJSON
			});
		}
	}
	
	var prettyString = JSON.stringify(jsonOut, null, 2);
	fs.writeFile(jsonFileName, prettyString, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The converted file was saved. All done!");
	}); 
	
  });
});

