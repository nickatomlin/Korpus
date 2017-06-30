/* So far, works only on ELAN files, not FLEX. */

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
	
	var metadata = jsonIn["document"]["interlinear-text"][0].item
	var cofanTitle = metadata[0]._;
	var englishTitle = metadata[1]._;
	var englishTitleType = metadata[1].$.type;
	var englishTitleLang = metadata[1].$.lang;
	
	var langs = jsonIn["document"]["interlinear-text"][0].languages[0].language;
	var cofanLangName = langs[0].$.lang;
	var cofanLangVernacular = langs[0].$.vernacular; // undefined on english and spanish
	var englishLangFont = langs[2].$.font;
	
	var cansefa = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph[2].phrases[0].word[2].words[0].word[7].item[0]._;
	console.log(cansefa);
	
	var faTiers = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph[2].phrases[0].word[2].words[0].word[7].morphemes[0].morph[1].item;
	console.log(faTiers);
	
	var faTxt = faTiers[0]._;
	var faCf = faTiers[1]._;
	var faGloss = faTiers[2]._;
	var faPos = faTiers[3]._;
	console.log(faTxt + " " + faCf + " " + faGloss + " " + faPos);
	var faGlossType = faTiers[2].$.type;
	var faGlossLang = faTiers[2].$.lang;
	
	var mingae = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph[0].phrases[0].word[0].words[0].word[0].item[0]._;
	console.log(mingae);
	
	
	var paragraphs = jsonIn["document"]["interlinear-text"][0].paragraphs[0].paragraph;
	for (var wrappedParagraph of paragraphs) {
		var paragraph = wrappedParagraph.phrases[0].word;
		console.log();
		for (var wrappedSentence of paragraph) {
			var sentence = wrappedSentence.words[0].word;
			console.log();
			for (var wordWithMorphs of sentence) {
				var wordvalue = wordWithMorphs.item[0]._;
				process.stdout.write(wordvalue + " ");
				var morphs = wordWithMorphs.morphemes[0].morph;
				for (var wrappedMorph of morphs) {
					var morphTiers = wrappedMorph.item;
					for (var tier of morphTiers) {
						var tierValue = tier._;
						var tierType = tier.$.type;
						var tierLang = tier.$.lang;
					}
				}
			}
		}
	}
	
	var prettyString = JSON.stringify(jsonIn, null, 2);
	fs.writeFile(jsonFileName, prettyString, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The converted file was saved. All done!");
	}); 
	
  });
});

