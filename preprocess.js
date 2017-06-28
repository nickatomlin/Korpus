/* So far, works only on ELAN files, not FLEX. */

var fs = require('fs');
var util = require('util');
var parseString = require('xml2js').parseString; // or we could use simple-xml
  
var xmlFileName = "C:\\xampp\\htdocs\\ETST\\elan_text_sync_tool\\elan_files\\test1.eaf";
var jsonFileName = "C:\\Users\\Kalinda\\Documents\\MEGAsync\\Linguistics\\UTRA\\data_conversion\\test1_preprocessed.js"

fs.readFile(xmlFileName, function (err, xml) {
  if (err) throw err;
  console.log(xml);

  parseString(xml, function (err, jsonIn) {
	console.dir(jsonIn);
	
	var jsonOut = 
	{"metadata": 
		{"tierIDs": {}, 
		"speakerIDs": {}
		},
	"speakers": {}
	};
	
	tiers = jsonIn.ANNOTATION_DOCUMENT.TIER
	tierNames = tiers.map((tier) => tier.$.TIER_ID);
	for (i = 0; i < tierNames.length; i++) {
		var newID = "T" + (i + 1).toString();
		jsonOut.metadata.tierIDs[newID] = tierNames[i];
	}
	
	indepTiers = tiers.filter((tier) => tier.$.PARENT_REF == null);
	for (i = 0; i < indepTiers.length; i++) {
		var newID = "S" + (i + 1).toString();
		tierHeader = indepTiers[i].$;
		jsonOut.metadata.speakerIDs[newID] = {
			"name": tierHeader.PARTICIPANT,
			"language": tierHeader.LANG_REF,
			// "tier": tierNameToID(tierHeader.TIER_ID)
			};
	}
	

	prettyString = JSON.stringify(jsonOut, null, 2);
	fs.writeFile(jsonFileName, prettyString, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
	}); 
  });
});

