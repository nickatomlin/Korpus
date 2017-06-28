/* So far, works only on ELAN files, not FLEX. */

var fs = require('fs');
var util = require('util');
var parseString = require('xml2js').parseString; // or we could use simple-xml
  
var xmlFileName = "C:\\xampp\\htdocs\\ETST\\elan_text_sync_tool\\elan_files\\test1.eaf";
var jsonFileName = "C:\\Users\\Kalinda\\Documents\\MEGAsync\\Linguistics\\UTRA\\data_conversion\\test1_preprocessed.js"

function swapJsonKeyValues(input) {
    var output = {};
    for (var value in input) {
		if (input.hasOwnProperty(value)) {
			output[input[value]] = value;
		}
    }
    return output;
}

// `children` should be a lookup table from each element to its list of children
function getDescendants(ancestor, children) { // not including ancestor itself
	if (children[ancestor] == null) {
		return [];
	}
	var descendants = children[ancestor];
	for (var child of children[ancestor]) {
		descendants = descendants.concat(getDescendants(child, children));
	}
	return descendants;
}

fs.readFile(xmlFileName, function (err, xml) {
  if (err) throw err;
  
  parseString(xml, function (err, jsonIn) {
	
	var timeslotsIn = jsonIn.ANNOTATION_DOCUMENT.TIME_ORDER[0].TIME_SLOT;
	var timeslots = [];
	for (var slot of timeslotsIn) {
		timeslots[slot.$.TIME_SLOT_ID] = slot.$.TIME_VALUE;
	}
	
	var jsonOut = 
	{"metadata": 
		{"tierIDs": {}, 
		"speakerIDs": {}
		},
	"speakers": {}
	};
	
	var tiersIncludeEmpty = jsonIn.ANNOTATION_DOCUMENT.TIER
	// discard tiers that have no annotations in them
	var tiers = tiersIncludeEmpty.filter((tier) => 
			tier.ANNOTATION != null && tier.ANNOTATION.length > 0);
	
	var tierChildren = {};
	for (var tier of tiers) {
		var parentName = tier.$.PARENT_REF
		if (parentName != null) {
			if (tierChildren[parentName] == null) {
				tierChildren[parentName] = [];
			}
			tierChildren[parentName].push(tier.$.TIER_ID);
		}
	}
	
	var tierNames = tiers.map((tier) => tier.$.TIER_ID);
	for (var i = 0; i < tierNames.length; i++) {
		var newID = "T" + (i + 1).toString();
		
		jsonOut.metadata.tierIDs[newID] = tierNames[i];
	}
	var tierIDsFromNames = swapJsonKeyValues(jsonOut.metadata.tierIDs);
	var indepTiers = tiers.filter((tier) => tier.$.PARENT_REF == null);
	
	// tierDependents goes from indep tier IDs to dep tier names
	var tierDependents = {};
	for (var indepTier of indepTiers) {
		var indepTierName = indepTier.$.TIER_ID
		var indepTierID = tierIDsFromNames[indepTierName];
		tierDependents[indepTierID] = getDescendants(indepTierName, tierChildren);
	}
	
	var annotationsFromIDs = {};
	for (var i = 0; i < indepTiers.length; i++) {
		var newID = "S" + (i + 1).toString();
		var tierHeader = indepTiers[i].$;
		
		jsonOut.metadata.speakerIDs[newID] = {
			"name": tierHeader.PARTICIPANT,
			"language": tierHeader.LANG_REF,
			"tier": tierIDsFromNames[tierHeader.TIER_ID]
			};
			
		jsonOut.speakers[newID] = [];

		for (var bigAnnotation of indepTiers[i].ANNOTATION) {
			var annotation = bigAnnotation.ALIGNABLE_ANNOTATION[0];
			annotationsFromIDs[annotation.$.ANNOTATION_ID] = annotation;
			jsonOut.speakers[newID].push({
				"start_time_ms": timeslots[annotation.$.TIME_SLOT_REF1],
				"end_time_ms": timeslots[annotation.$.TIME_SLOT_REF2],
				/* "num_slots": get_num_slots(
						annotation.$.TIME_SLOT_REF1, 
						annotation.$.TIME_SLOT_REF2),
						*/
				"text": annotation.ANNOTATION_VALUE[0],
				"dependents": []
			})
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
