const fs = require('fs');
const parseXml = require('xml2js').parseString;
const eafUtils = require('./eaf_utils');
const helper = require('./helper_functions');

function updateIndex(indexMetadata, indexFileName, storyID) {
  let index = JSON.parse(fs.readFileSync(indexFileName, "utf8"));
  index[storyID] = indexMetadata;
  fs.writeFileSync(indexFileName, JSON.stringify(index, null, 2));
}

function assignSlots(anotID, slotNumPtr, tiersToConstraints, 
    annotationChildren, startSlots, endSlots) {
  
  startSlots[anotID] = slotNumPtr.contents;
  
  const aloneDeps = [];
  for (const depTierName in annotationChildren[anotID]) {
    if (annotationChildren[anotID].hasOwnProperty(depTierName)) {
      depAnotIDs = annotationChildren[anotID][depTierName];
      if (depAnotIDs.length == 1) { // FIXME stretches 'included_in' annotations to parent's length
        aloneDeps.push(depAnotIDs[0]);
      } else {
        
        let prevTimeslot = null; // used for detecting gaps
        let maybeGaps = (tiersToConstraints[depTierName] === 'Included_In');
        if (maybeGaps) {
          prevTimeslot = eafUtils.getAlignableAnnotationStartSlot(annotationsFromIDs[anotID]);
        }
        
        for (depAnotID of depAnotIDs) {
          if (maybeGaps) {
            const startTimeslot = eafUtils.getAlignableAnnotationStartSlot(annotationsFromIDs[depAnotID]);
            if (startTimeslot !== prevTimeslot 
                && timeslots[startTimeslot] !== timeslots[prevTimeslot]) {
              slotNumPtr.contents++ // there's a gap
            }
            prevTimeslot = eafUtils.getAlignableAnnotationEndSlot(annotationsFromIDs[depAnotID]);
          }
          
          assignSlots(depAnotID, slotNumPtr, tiersToConstraints, annotationChildren, 
              startSlots, endSlots);
        }
        
        if (maybeGaps) { 
          const endTimeslot = eafUtils.getAlignableAnnotationEndSlot(annotationsFromIDs[anotID]);
          if (endTimeslot !== prevTimeslot 
              && timeslots[endTimeslot] !== timeslots[prevTimeslot]) {
            slotNumPtr.contents++ // there's a gap
          }
        }
      }
    }
  }
  
  // ensure this annotation has at least one slot
  if (slotNumPtr.contents === startSlots[anotID]) {
    slotNumPtr.contents++;
  }
  
  endSlots[anotID] = slotNumPtr.contents;
  for (depAnotID of aloneDeps) {
    startSlots[depAnotID] = startSlots[anotID];
    endSlots[depAnotID] = endSlots[anotID];
  }
}

function preprocess(adocIn, jsonFilesDir, xmlFileName, callback) {
    const storyID = eafUtils.getDocID(adocIn);
    const indexMetadata = helper.improveElanIndexData(xmlFileName, storyID, adocIn);
    updateIndex(indexMetadata, "data/index2.json", storyID);
    updateIndex(indexMetadata, "data/index2.json", storyID);
    const jsonOut = {
      "metadata": indexMetadata,
      "sentences": []
    };
    jsonOut.metadata["tier IDs"] = {};
    jsonOut.metadata["speaker IDs"] = {};
    jsonOut.metadata["story ID"] = storyID;

    const tiers = eafUtils.getNonemptyTiers(adocIn);
    const indepTiers = tiers.filter((tier) => eafUtils.getParentTierName(tier) == null);
    
    // give each tier an ID
    let tierIDsFromNames = {};
    for (let i = 0; i < tiers.length; i++) {
      const newID = "T" + (i + 1).toString();
      const tier = tiers[i];
      const tierName = eafUtils.getTierName(tier);
      jsonOut.metadata["tier IDs"][newID] = {
        name: tierName,
        subdivided: eafUtils.isTierSubdivided(tierName, tiers),
      };
      tierIDsFromNames[tierName] = newID;
    }
    
    // TODO glom morphs if coming from FLEx ... or, glom if untimed?
    
    // annotationChildren: parentAnnotationID -> childTierName(sparse) -> listof childAnnotationID
    const annotationChildren = {};
    for (const tier of tiers) {
      const childTierName = eafUtils.getTierName(tier);
      for (const annotation of eafUtils.getAnnotations(tier)) {
        const childAnnotationID = eafUtils.getAnnotationID(annotation);
        
        // FIXME relies on ANNOTATION_REF, which is only defined on REF_ANNOTATIONs, not ALIGNABLE_ANNOTATIONs
        let parentAnnotationID = eafUtils.getParentAnnotationID(annotation); 
        if (parentAnnotationID == null) {
          parentAnnotationID = '';
        }
        
        if (annotationChildren[parentAnnotationID] == null) {
          annotationChildren[parentAnnotationID] = {}
        }
        if (annotationChildren[parentAnnotationID][childTierName] == null) {
          annotationChildren[parentAnnotationID][childTierName] = [];
        }
        annotationChildren[parentAnnotationID][childTierName].push(childAnnotationID);
      }
    }
    
    // tiersToConstraints: tierName -> constraintName
    // (to generate, first create typesToConstraints: linguisticTypeName -> constraintName)
    const typesToConstraints = {};
    const linguisticTypes = adocIn.LINGUISTIC_TYPE
    for (const lType of linguisticTypes) {
      const lTypeID = lType.$.LINGUISTIC_TYPE_ID;
      const constraintName = lType.$.CONSTRAINTS || '';
      typesToConstraints[lType] = constraintName;
    }
    const tiersToConstraints = {};
    for (const tier of tiers) {
      const tierName = eafUtils.getTierName(tier);
      const linguisticType = tier.$.LINGUISTIC_TYPE_REF;
      const constraintName = typesToConstraints[linguisticType];
      tiersToConstraints[tierName] = constraintName;
    }
    
    const annotationsFromIDs = eafUtils.getAnnotationIDMap(tiers);
    const timeslots = eafUtils.getDocTimeslotsMap(adocIn);
    
    // sort children
    for (const parentAnnotationID in annotationChildren) {
      if (annotationChildren.hasOwnProperty(parentAnnotationID)) {
        for (const childTierName in annotationChildren[parentAnnotationID]) {
          const childIDs = annotationChildren[parentAnnotationID][childTierName];
          const sortedChildIDs = [];
          const constraint = tiersToConstraints[childTierName];
          if (constraint === 'Symbolic_Association') { // 1-1 association
            // assert childIDs.length === 1; 
            sortedChildIDs = childIDs;
          } else if (constraint === 'Symbolic_Subdivision') { // untimed subdivision, ordered
            let prev = '';
            for (const id of childIDs) {
              const cur = childIDs.findFirst(a => 
                prev === (annotationsFromIDs[a].$.PREVIOUS_ANNOTATION || '')
              );
              sortedChildIDs.push(cur);
              prev = cur;
            }
          } else if (constraint === 'Time_Subdivision') { // timed subdivision, no gaps
            let prevSlot = eafUtils.getAlignableAnnotationStartSlot(
                annotationsFromIDs[parentAnnotationID]);
            for (const id of childIDs) {
              const cur = childIDs.findFirst(a => 
                prevSlot === eafUtils.getAlignableAnnotationStartSlot(annotationsFromIDs[a])
              );
              sortedChildIDs.push(cur);
              prevSlot = eafUtils.getAlignableAnnotationEndSlot(cur);
            }
          } else if (constraint === 'Included_In') { // timed subdivision, gaps allowed
            // warn if an ms value is missing
            const missingMs = childIDs.filter(a => timeslots[annotationsFromIDs[a]] == null);
            if (missingMs.length > 0) {
              console.log(`WARNING: missing times in tier ${childTierName}. Annotations may display out of order.`);
              // TODO use additional clues when sorting: timeslot id order and shared timeslots
            }
            
            sortedChildIDs = childIDs.sort((a1,a2) => 
              parseInt(timeslots[annotationsFromIDs[a1]]) - 
              parseInt(timeslots[annotationsFromIDs[a2]])
            );
          } else { // this should never happen
            console.log(`WARNING: missing or unrecognized ELAN stereotype for tier ${childTierName}. Annotations may display out of order.`);
            sortedChildIDs = childIDs;
          }
          
          annotationChildren[parentAnnotationID][childTierName] = sortedChildIDs;
        }
      }
    }
    
    for (let i = 0; i < indepTiers.length; i++) {
      const spkrID = "S" + (i + 1).toString(); // assume each independent tier has a distinct speaker
      const indepTierName = eafUtils.getTierName(indepTiers[i]);
      const tierID = tierIDsFromNames[indepTierName];
      
      jsonOut.metadata["speaker IDs"][spkrID] = {
        "name": eafUtils.getTierSpeakerName(indepTiers[i]),
        "language": eafUtils.getTierLanguage(indepTiers[i]),
        "tier": tierID,
      };
      
      for (const indepAnot of eafUtils.getTierAnnotations(indepTier)) {
        const indepAnotID = eafUtils.getAnnotationID(indepAnot);
        const anotStartSlots = {};
        const anotEndSlots = {};
        assignSlots(indepAnotID, slotnumPtr, tiersToConstraints, annotationChildren, anotStartSlots, anotEndSlots);
        
        const sentenceJson = {
          "speaker": spkrID,
          "tier": tierID,
          "start_time_ms": timeslots[eafUtils.getAlignableAnnotationStartSlot(indepAnot)], // TODO parse to int?
          "end_time_ms": timeslots[eafUtils.getAlignableAnnotationEndSlot(indepAnot)], // TODO parse to int?
          "text": eafUtils.getAnnotationValue(indepAnot),
          "dependents": [],
          "num_slots": anotEndSlots[indepAnotID],
        };
        
        for (const depTierName in annotationChildren[indepAnotID]) {
          if (annotationChildren[indepAnotID].hasOwnProperty(depTierName)) {
            const depTierJson = {
              "tier": tierIDsFromNames[depTierName],
              "values": [],
            };
            
            for (const depAnotID of annotationChildren[indepAnotID][depTierName]) {
              const depAnot = annotationsFromIDs[depAnotID];
              depTierJson.values.push({
                "start_slot": anotStartSlots[depAnotID],
                "end_slot": anotEndSlots[depAnotID],
                "value": eafUtils.getAnnotationValue(depAnot),
              });
            }
          }
        }
      }
    }
    
    const jsonPath = jsonFilesDir + storyID + ".json";
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2));
    // console.log("✅  Correctly wrote " + storyID + ".json");
    callback();
}

function preprocess_dir(eafFilesDir, jsonFilesDir, callback) {
  const eafFileNames = fs.readdirSync(eafFilesDir).filter(f => f[0] != "."); // excludes hidden files
  
  // use this to wait for all preprocess calls to terminate before executing the callback
  const status = {numJobs: eafFileNames.length};
  const whenDone = function () {
    status.numJobs--;
    if (status.numJobs === 0) {
      callback();
    }
  };

  for (const eafFileName of eafFileNames) {
    console.log("Processing " + eafFileName);
    const eafPath = eafFilesDir + eafFileName;
    fs.readFile(eafPath, function (err1, xmlData) {
      if (err1) throw err1;
      parseXml(xmlData, function (err2, jsonData) {
        if (err2) throw err2;
        const adoc = jsonData.ANNOTATION_DOCUMENT
        preprocess(adoc, jsonFilesDir, eafFileName, whenDone);
      });
    });
  }
}

module.exports = {
  preprocess_dir: preprocess_dir,
  preprocess: preprocess,
};
