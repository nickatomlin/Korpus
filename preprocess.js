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

function getTimeslotSet(tier) {
	if (tier.ANNOTATION[0].ALIGNABLE_ANNOTATION == null) {
		// no timestamps in this tier; it's all `REF_ANNOTATION`s
		return new Set();
	}
	annotations = tier.ANNOTATION.map((a) => a.ALIGNABLE_ANNOTATION[0]);
	var startSlots = new Set(annotations.map((a) => a.$.TIME_SLOT_REF1));
	var endSlots = new Set(annotations.map((a) => a.$.TIME_SLOT_REF2));
	for (var slot of endSlots) {
		startSlots.add(slot);
	}
	return startSlots;
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
	
	// tierDependents: indep tier name -> list of dep tier names
	var tierDependents = {};
	for (var indepTier of indepTiers) {
		var indepTierName = indepTier.$.TIER_ID;
		tierDependents[indepTierName] = getDescendants(indepTierName, tierChildren);
	}
	
	/* tierTimeslots: independent_tier_id -> time_ms -> rank,
		where a timeslot's "rank" is what its index would be 
		in a time-ordered array of the unique timeslots for this speaker */
	var tierTimeslots = {};
	for (indepTier of indepTiers) {
		var indepTierName = indepTier.$.TIER_ID;
		var indepTierID = tierIDsFromNames[indepTierName];
		
		var slots = getTimeslotSet(indepTier);
		var depTiers = tiers.filter((tier) => 
			tierDependents[indepTierName].includes(tier.$.TIER_ID)
		);
		for (var depTier of depTiers) {
			for (slot of getTimeslotSet(depTier)) {
				slots.add(slot);
			}
		}
		
		var slotsArray = Array.from(slots)
		var times = slotsArray.map((slot) => timeslots[slot]);
		var sorted_times = times.sort((a, b) => a - b); // callback ensures numeric (not alphabet) sorting
		var time_indices = swapJsonKeyValues(sorted_times);
		
		tierTimeslots[indepTierID] = time_indices;
	}
	
	var annotationsFromIDs = {};
	for (var i = 0; i < indepTiers.length; i++) {
		var newID = "S" + (i + 1).toString();
		var tierHeader = indepTiers[i].$;
		var tierID = tierIDsFromNames[tierHeader.TIER_ID];
		
		jsonOut.metadata.speakerIDs[newID] = {
			"name": tierHeader.PARTICIPANT,
			"language": tierHeader.LANG_REF,
			"tier": tierID
			};
			
		jsonOut.speakers[newID] = [];

		for (var bigAnnotation of indepTiers[i].ANNOTATION) {
			var annotation = bigAnnotation.ALIGNABLE_ANNOTATION[0];
			annotationsFromIDs[annotation.$.ANNOTATION_ID] = annotation;
			var start_time_ms = parseInt(timeslots[annotation.$.TIME_SLOT_REF1], 10); // TODO should things be parsed to ints earlier in the code? might be better style
			var end_time_ms = parseInt(timeslots[annotation.$.TIME_SLOT_REF2], 10);
			var start_slot = parseInt(tierTimeslots[tierID][start_time_ms], 10);
			var end_slot = parseInt(tierTimeslots[tierID][end_time_ms], 10);
			var num_slots = 1 + end_slot - start_slot;
			jsonOut.speakers[newID].push({
				"start_time_ms": start_time_ms,
				"end_time_ms": end_time_ms,
				"start_slot": start_slot,
				"end_slot": end_slot,
				"num_slots": num_slots,
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

