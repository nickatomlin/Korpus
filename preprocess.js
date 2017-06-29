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
	
	/* tierTimeslots: independent_tier_id -> timeslot_id -> rank,
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
		
		var slotsArray = Array.from(slots);
		var sorted_slots = slotsArray.sort((s1, s2) => parseInt(s1.slice(2)) - parseInt(s2.slice(2)));
		var slot_indices = swapJsonKeyValues(sorted_slots);
		
		tierTimeslots[indepTierID] = slot_indices;
	}
	
	var bigAnnotationsFromIDs = {};
	for (var tier of tiers) {
		if (tier.ANNOTATION[0].ALIGNABLE_ANNOTATION != null) {
			for (var bigAnnotation of tier.ANNOTATION) {
				var annotationID = bigAnnotation.ALIGNABLE_ANNOTATION[0].$.ANNOTATION_ID;
				bigAnnotationsFromIDs[annotationID] = bigAnnotation;
			}
		} else {
			// REF_ANNOTATIONs
			for (var bigAnnotation of tier.ANNOTATION) {
				var annotationID = bigAnnotation.REF_ANNOTATION[0].$.ANNOTATION_ID;
				bigAnnotationsFromIDs[annotationID] = bigAnnotation;
			}
		}
	}
	
	for (var i = 0; i < indepTiers.length; i++) {
		
		var spkrID = "S" + (i + 1).toString();
		var tierName = indepTiers[i].$.TIER_ID;
		var spkrName = indepTiers[i].$.PARTICIPANT;
		var language = indepTiers[i].$.LANG_REF;
		var tierID = tierIDsFromNames[tierName];
		
		jsonOut.metadata.speakerIDs[spkrID] = {
			"name": spkrName,
			"language": language,
			"tier": tierID
			};
			
		jsonOut.speakers[spkrID] = [];
		
		var depTiers = tiers.filter((tier) => 
			tierDependents[indepTierName].includes(tier.$.TIER_ID)
		);

		for (var bigAnnotation of indepTiers[i].ANNOTATION) {
			var annotation = bigAnnotation.ALIGNABLE_ANNOTATION[0];
			
			var i_raw_start_slot = annotation.$.TIME_SLOT_REF1;
			var i_raw_end_slot = annotation.$.TIME_SLOT_REF2;
			var i_start_time_ms = parseInt(timeslots[i_raw_start_slot], 10); // TODO should things be parsed to ints earlier in the code? might be better style
			var i_end_time_ms = parseInt(timeslots[i_raw_end_slot], 10);
			var i_start_slot = parseInt(tierTimeslots[tierID][i_raw_start_slot], 10);
			var i_end_slot = parseInt(tierTimeslots[tierID][i_raw_end_slot], 10);
			var num_slots = i_end_slot - i_start_slot;
			
			var indepTierJson = {
				"tier": tierID,
				"start_time_ms": i_start_time_ms,
				"end_time_ms": i_end_time_ms,
				"num_slots": num_slots,
				"text": annotation.ANNOTATION_VALUE[0],
				"dependents": []
			};
			
			for (var depTier of depTiers) {
				var depTierID = tierIDsFromNames[depTier.$.TIER_ID];
				var depTierJson = {
					"tier": depTierID, 
					"values": []
				};
				
				for (var bigAnnotation of depTier.ANNOTATION) {
					var value; 
					if (bigAnnotation.ALIGNABLE_ANNOTATION != null) {
						value = bigAnnotation.ALIGNABLE_ANNOTATION[0].ANNOTATION_VALUE;
					} else {
						value = bigAnnotation.REF_ANNOTATION[0].ANNOTATION_VALUE;
					}
					
					var currentBigAnnotation = bigAnnotation;
					while (currentBigAnnotation.ALIGNABLE_ANNOTATION == null) {
						var parentAnnotationID = currentBigAnnotation.REF_ANNOTATION[0].$.ANNOTATION_REF; 
						var currentBigAnnotation = bigAnnotationsFromIDs[parentAnnotationID];
					}
					var timeAnnotation = currentBigAnnotation.ALIGNABLE_ANNOTATION[0];
					
					var d_raw_start_slot = timeAnnotation.$.TIME_SLOT_REF1;
					var d_raw_end_slot =  timeAnnotation.$.TIME_SLOT_REF2;
					var d_start_time_ms = timeslots[d_raw_start_slot];
					var d_end_time_ms = timeslots[d_raw_end_slot];
					if (d_start_time_ms >= i_start_time_ms && d_end_time_ms <= i_end_time_ms) {
						// this dependent annotation goes with the current independent annotation
						
						var d_raw_start_slot = parseInt(tierTimeslots[tierID][d_raw_start_slot], 10);
						var d_raw_end_slot = parseInt(tierTimeslots[tierID][d_raw_end_slot], 10);
						var d_rel_start_slot = d_raw_start_slot - i_start_slot;
						var d_rel_end_slot = d_raw_end_slot - i_start_slot;
						
						depTierJson.values.push({
							"start_slot": d_rel_start_slot,
							"end_slot": d_rel_end_slot,
							"value": value
						});
					}
				}
				
				/*if (depTier.ANNOTATION[0].ALIGNABLE_ANNOTATION == null) {
					// REF_ANNOTATION
					for (var bigAnnotation of depTier.ANNOTATION) {
						var annotation = bigAnnotation.REF_ANNOTATION[0];
						
						var parentAnnotationID = annotation.$.ANNOTATION_REF; 
						var parentAnnotation = bigAnnotationsFromIDs[parentAnnotationID];
						while (parentAnnotation.$.ANNOTATION_REF )
						
						/* depTierJson.values.push({
							"start_slot": d_rel_start_slot,
							"end_slot": d_rel_end_slot,
							"value": value
						});
						* /
					}
				} else { 
					// ALIGNABLE_ANNOTATION
					for (var bigAnnotation of depTier.ANNOTATION) {
						var annotation = bigAnnotation.ALIGNABLE_ANNOTATION[0];
						
						var d_start_time_ms = timeslots[annotation.$.TIME_SLOT_REF1];
						var d_end_time_ms = timeslots[annotation.$.TIME_SLOT_REF2];
						if (d_start_time_ms >= i_start_time_ms && d_end_time_ms <= i_end_time_ms) {
							// this dependent annotation goes with the current independent annotation
							
							var d_raw_start_slot = parseInt(tierTimeslots[tierID][d_start_time_ms], 10);
							var d_raw_end_slot = parseInt(tierTimeslots[tierID][d_end_time_ms], 10);
							var d_rel_start_slot = d_raw_start_slot - i_start_slot;
							var d_rel_end_slot = d_raw_end_slot - i_start_slot;
							
							var value = annotation.ANNOTATION_VALUE;
							
							depTierJson.values.push({
								"start_slot": d_rel_start_slot,
								"end_slot": d_rel_end_slot,
								"value": value
							});
						}
					}
				}
				*/
				indepTierJson.dependents.push(depTierJson);
			}
			jsonOut.speakers[spkrID].push(indepTierJson);
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

