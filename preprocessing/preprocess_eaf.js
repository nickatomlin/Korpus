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
    annotationChildren, annotationsFromIDs, timeslots, startSlots, endSlots) {
  
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
              annotationsFromIDs, timeslots, startSlots, endSlots);
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
  jsonOut.metadata["story ID"] = storyID; // TODO is this needed?

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
  
  // tiersToConstraints: tierName -> constraintName
  // (to generate, first create typesToConstraints: linguisticTypeName -> constraintName)
  const typesToConstraints = {};
  const linguisticTypes = adocIn.LINGUISTIC_TYPE
  for (const lType of linguisticTypes) {
    const lTypeID = lType.$.LINGUISTIC_TYPE_ID;
    const constraintName = lType.$.CONSTRAINTS || '';
    typesToConstraints[lTypeID] = constraintName;
  }
  const tiersToConstraints = {};
  for (const tier of tiers) {
    const tierName = eafUtils.getTierName(tier);
    const linguisticType = tier.$.LINGUISTIC_TYPE_REF;
    const constraintName = typesToConstraints[linguisticType];
    tiersToConstraints[tierName] = constraintName;
  }
  // console.log(`tiersToConstraints: ${tiersToConstraints}`);
  
  const untimedTiers = tiers.filter(tier => 
    (tiersToConstraints[eafUtils.getTierName(tier)] === 'Symbolic_Subdivision' 
    || tiersToConstraints[eafUtils.getTierName(tier)] === 'Symbolic_Association')
  );
  
  // annotationChildren: parentAnnotationID -> childTierName(sparse) -> listof childAnnotationID
  const annotationChildren = {};
  for (const tier of untimedTiers) {
    const childTierName = eafUtils.getTierName(tier);
    console.log(`adding untimed child tier ${childTierName} to annotationChildren`);
    for (const annotation of eafUtils.getAnnotations(tier)) {
      const childAnnotationID = eafUtils.getAnnotationID(annotation);
      let parentAnnotationID = annotation.REF_ANNOTATION[0].$.ANNOTATION_REF; 
      
      if (annotationChildren[parentAnnotationID] == null) {
        annotationChildren[parentAnnotationID] = {}
      }
      if (annotationChildren[parentAnnotationID][childTierName] == null) {
        annotationChildren[parentAnnotationID][childTierName] = [];
      }
      annotationChildren[parentAnnotationID][childTierName].push(childAnnotationID);
    }
  }
  
  const annotationsFromIDs = eafUtils.getAnnotationIDMap(tiers);
  const timeslots = eafUtils.getDocTimeslotsMap(adocIn);
  
  // sort untimed children
  for (const parentAnnotationID in annotationChildren) {
    if (annotationChildren.hasOwnProperty(parentAnnotationID)) {
      for (const childTierName in annotationChildren[parentAnnotationID]) {
        const childIDs = annotationChildren[parentAnnotationID][childTierName];
        let sortedChildIDs = [];
        const constraint = tiersToConstraints[childTierName];
        if (constraint === 'Symbolic_Association') { // 1-1 association
          // assert childIDs.length === 1; 
          sortedChildIDs = childIDs;
        } else if (constraint === 'Symbolic_Subdivision') { // untimed subdivision, ordered
          let prev = '';
          for (const id of childIDs) {
            const cur = childIDs.find(a => 
              prev === (annotationsFromIDs[a].REF_ANNOTATION[0].$.PREVIOUS_ANNOTATION || '')
            );
            sortedChildIDs.push(cur);
            prev = cur;
          }
        } else { // this should never happen
          console.log(`WARNING: missing or unrecognized ELAN stereotype for tier ${childTierName}. Annotations may display out of order.`);
          sortedChildIDs = childIDs;
        }
        
        annotationChildren[parentAnnotationID][childTierName] = sortedChildIDs;
      }
    }
  }
  
  const tierChildren = eafUtils.getTierChildrenMap(tiers);
  
  // add sorted 'Time_Subdivision' children
  for (const parentTier of tiers) {
    const childTierNames = tierChildren[eafUtils.getTierName(parentTier)] || [];
    const timeSubdivChildTiers = tiers.filter(tier => 
      tiersToConstraints[eafUtils.getTierName(tier)] === 'Time_Subdivision'
      && childTierNames.find(n => n === eafUtils.getTierName(tier)) != null
    );
    for (const childTier of timeSubdivChildTiers) {
      const childTierName = eafUtils.getTierName(childTier);
      console.log(`adding time-subdiv child tier ${childTierName} to annotationChildren`);
      const childTierAnots = eafUtils.getAnnotations(childTier);
      for (const parentAnot of eafUtils.getAnnotations(parentTier)) {
        const sortedChildIDs = [];
        let prevSlot = eafUtils.getAlignableAnnotationStartSlot(parentAnot);
        const endSlot = eafUtils.getAlignableAnnotationEndSlot(parentAnot);
        while (prevSlot !== endSlot) {
          /* partial procedural rewrite of find code: 
          let cur;
          for (const childAnot of childAnots) {
            const childSlot = eafUtils.getAlignableAnnotationStartSlot(childAnot);
            if (prevSlot === childSlot) {
              cur = childAnot;
              
            }
          }*/
          const cur = childTierAnots.find(a => 
            prevSlot === eafUtils.getAlignableAnnotationStartSlot(a) || 
            (timeslots[prevSlot] != null && 
            timeslots[prevSlot] === eafUtils.getAlignableAnnotationStartSlot(a)
            )
          );
          if (cur == null) {
            console.log('next timeSubdiv annotation not found');
            console.log(`storyID = ${storyID}`);
            console.log(`childTierName = ${childTierName}, prevSlot = ${prevSlot}`);
          }
          const curID = eafUtils.getAnnotationID(cur);
          sortedChildIDs.push(curID);
          prevSlot = eafUtils.getAlignableAnnotationEndSlot(cur);
        }
        
        const parentAnotID = eafUtils.getAnnotationID(parentAnot);
        annotationChildren[parentAnotID][childTierName] = sortedChildIDs;
      }
    }
  }
  
  // add 'Included_In' children
  for (const parentTier of tiers) {
    const childTierNames = tierChildren[eafUtils.getTierName(parentTier)] || [];
    const inclChildTiers = tiers.filter(tier => 
      tiersToConstraints[eafUtils.getTierName(tier)] === 'Included_In'
      && childTierNames.find(n => n === eafUtils.getTierName(tier)) != null
    );
    for (const childTier of inclChildTiers) {
      const childTierName = eafUtils.getTierName(childTier);
      console.log(`adding incl-in child tier ${childTierName} to annotationChildren`);
      const childTierAnots = eafUtils.getAnnotations(childTier);
      for (const parentAnot of eafUtils.getAnnotations(parentTier)) {
        let childIDs = [];
        const parentStartSlot = eafUtils.getAlignableAnnotationStartSlot(parentAnot);
        const parentEndSlot = eafUtils.getAlignableAnnotationEndSlot(parentAnot);
        
        const parentStartMs = timeslots[parentStartSlot];
        const parentEndMs = timeslots[parentEndSlot];
        if (parentStartMs && parentEndMs) { // get children within these ms values
          for (anot of childTierAnots) {
            const anotID = eafUtils.getAnnotationID(anot);
            const startSlot = eafUtils.getAlignableAnnotationStartSlot(anot);
            const endSlot = eafUtils.getAlignableAnnotationEndSlot(anot);
            const startsWithin = (
              timeslots[startSlot] >= parentStartMs 
              && timeslots[startSlot] < parentEndMs
            );
            const endsWithin = (
              timeslots[endSlot] > parentStartMs 
              && timeslots[endSlot] <= parentEndMs
            );
            if (startsWithin || endsWithin) {
              childIDs.push(anotID);
            }
          }
          
          // sort by ms value
          childIDs = childIDs.sort((a1,a2) => {
            // if start isn't defined, calculate it based on end, pretending duration is 1 ms
            const start1 = (
              timeslots[eafUtils.getAlignableAnnotationStartSlot(a1)] 
              || timeslots[eafUtils.getAlignableAnnotationEndSlot(a1)] - 1
            );
            const start2 = (
              timeslots[eafUtils.getAlignableAnnotationStartSlot(a2)] 
              || timeslots[eafUtils.getAlignableAnnotationEndSlot(a2)] - 1
            );
            return start1 - start2;
          });
        }
        
        // check for children which share the parent's start or end slot
        for (anot of childTierAnots) {
          const anotID = eafUtils.getAnnotationID(anot);
          const startSlot = eafUtils.getAlignableAnnotationStartSlot(anot);
          const endSlot = eafUtils.getAlignableAnnotationEndSlot(anot);
          if (startSlot === parentStartSlot && anotID !== childIDs[0]) {
            childIDs.splice(0, 0, anotID); // insert at beginning
          } else if (endSlot === parentEndSlot && anotID !== childIDs[childIDs.length - 1]) {
            childIDs.push(anotID);
          } 
        }
        
        // add children which share a boundary with an existing child
        // (but not if they end at the first child or start at the last child)
        const prevIndex = 0;
        while (prevIndex < childIDs.length - 1) {
          const prevID = childIDs[prevIndex];
          const prevAnot = annotationsFromIDs[prevID];
          const prevSlot = eafUtils.getAlignableAnnotationEndSlot(prevAnot);
          
          const nextID = childIDs[prevIndex + 1];
          const nextAnot = annotationsFromIDs[nextID];
          const nextSlot = eafUtils.getAlignableAnnotationStartSlot(nextAnot)
          
          let newAnot = childTierAnots.find(a => 
            eafUtils.getAlignableAnnotationStartSlot(a) === prevSlot
          );
          if (newAnot == null) {
            newAnot = childTierAnots.find(
              eafUtils.getAlignableAnnotationEndSlot(a) === nextSlot
            );
          }
          const newID = eafUtils.getAnnotationID(newAnot);
          if (newID != null && newID != nextID) {
            childIDs.splice(prevIndex + 1, 0, newID); // insert after prevIndex
          }
          
          prevIndex++;
        }
        
        const parentAnotID = eafUtils.getAnnotationID(parentAnot);
        if (!annotationChildren.hasOwnProperty(parentAnotID)) {
          annotationChildren[parentAnotID] = {};
        }
        annotationChildren[parentAnotID][childTierName] = childIDs;
      }
    }
  }
  
  jsonOut['annotationChildren'] = annotationChildren; // TODO remove when no longer needed for debugging
  
  const anotDescendants = {}; // indepAnotID -> depTierName -> ordered listof anotIDs descended from indepAnot
  for (const indepTier of indepTiers) {
    for (const indepAnot of eafUtils.getAnnotations(indepTier)) {
      const indepAnotID = eafUtils.getAnnotationID(indepAnot);
      const depTiersAnots = {}; // depTierName -> ordered listof anotIDs descended from indepAnot
      let pendingParentIDs = [indepAnotID];
      while (pendingParentIDs.length > 0) {
        const parentID = pendingParentIDs[0];
        pendingParentIDs.shift() // remove parentID from pendingParentIDs
        // add all of parentID's direct children to depTierAnots and to pendingParentIDs
        for (const depTierName in annotationChildren[parentID]) {
          if (annotationChildren[parentID].hasOwnProperty(depTierName)) {
            const childIDs = annotationChildren[parentID][depTierName];
            if (!depTiersAnots.hasOwnProperty(depTierName)) {
              depTiersAnots[depTierName] = [];
            }
            depTiersAnots[depTierName] = depTiersAnots[depTierName].concat(childIDs);
            pendingParentIDs = pendingParentIDs.concat(childIDs);
          }
        }
      }
      anotDescendants[indepAnotID] = depTiersAnots;
    }
  }
  jsonOut['anotDescendants'] = anotDescendants; // TODO remove when no longer needed for debugging
  
  for (let i = 0; i < indepTiers.length; i++) {
    const spkrID = "S" + (i + 1).toString(); // assume each independent tier has a distinct speaker
    const indepTierName = eafUtils.getTierName(indepTiers[i]);
    const tierID = tierIDsFromNames[indepTierName];
    
    jsonOut.metadata["speaker IDs"][spkrID] = {
      "name": eafUtils.getTierSpeakerName(indepTiers[i]),
      "language": eafUtils.getTierLanguage(indepTiers[i]),
      "tier": tierID,
    };
    
    for (const indepAnot of eafUtils.getAnnotations(indepTiers[i])) {
      const indepAnotID = eafUtils.getAnnotationID(indepAnot);
      const slotnumPtr = {contents: 0};
      const anotStartSlots = {};
      const anotEndSlots = {};
      assignSlots(indepAnotID, slotnumPtr, tiersToConstraints, annotationChildren, 
        annotationsFromIDs, timeslots, anotStartSlots, anotEndSlots
      );
      
      const sentenceJson = {
        "speaker": spkrID,
        "tier": tierID,
        "start_time_ms": parseInt(timeslots[eafUtils.getAlignableAnnotationStartSlot(indepAnot)], 10),
        "end_time_ms": parseInt(timeslots[eafUtils.getAlignableAnnotationEndSlot(indepAnot)], 10),
        "text": eafUtils.getAnnotationValue(indepAnot),
        "anotID": indepAnotID, // TODO remove when no longer needed for debugging
        "dependents": [],
        "num_slots": anotEndSlots[indepAnotID],
      };
      
      const depTiersAnots = anotDescendants[indepAnotID];
      for (const depTierName in depTiersAnots) {
        if (depTiersAnots.hasOwnProperty(depTierName)) {
          const depTierJson = {
            "tier": tierIDsFromNames[depTierName],
            "values": [],
          };
          
          for (const depAnotID of depTiersAnots[depTierName]) {
            const depAnot = annotationsFromIDs[depAnotID];
            depTierJson.values.push({
              "start_slot": anotStartSlots[depAnotID],
              "end_slot": anotEndSlots[depAnotID],
              "anotID": eafUtils.getAnnotationID(depAnot), // TODO remove when no longer needed for debugging
              "value": eafUtils.getAnnotationValue(depAnot),
            });
          }
          
          sentenceJson.dependents.push(depTierJson); // TODO check order
        }
      }
      
      jsonOut.sentences.push(sentenceJson); // TODO check order
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
