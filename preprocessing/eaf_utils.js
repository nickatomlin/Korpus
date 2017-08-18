/* functions for accessing data within FLEx's format (except parsed to JSON): */
const noteUtils = require('./eaf_annotation_utils');

// returns a map from each timeslotID to its time value in ms
function getDocTimeslotsMap(doc) {
  const timeslotsIn = doc.ANNOTATION_DOCUMENT.TIME_ORDER[0].TIME_SLOT;
  let timeslots = [];
  for (const slot of timeslotsIn) {
    timeslots[slot.$.TIME_SLOT_ID] = slot.$.TIME_VALUE;
  }
  return timeslots;
}

// returns a list of tiers (JSON objects)
function getNonemptyTiers(doc) {
  const allTiers = doc.ANNOTATION_DOCUMENT.TIER;
  return allTiers.filter((tier) =>
      tier.ANNOTATION != null && tier.ANNOTATION.length > 0
  );
}

// returns a map: tier name -> list of tier names of its children
function getTierChildrenMap(tiers) {
  const tierChildren = {};
  for (const tier of tiers) {
    const parentName = getParentTierName(tier);
    if (parentName != null) {
      if (tierChildren[parentName] == null) {
        tierChildren[parentName] = [];
      }
      tierChildren[parentName].push(getTierName(tier));
    }
  }
  return tierChildren;
}

// `children` should be a lookup table from each element to its list of children
function getDescendants(ancestor, children) { // not including ancestor itself
  if (children[ancestor] == null) {
    return [];
  }
  let descendants = children[ancestor];
  for (const child of children[ancestor]) {
    descendants = descendants.concat(getDescendants(child, children));
  }
  return descendants;
}

// return a map from indep tier name to list of dep tier names
function getTierDependentsMap(tiers) {
  const indepTiers = tiers.filter((tier) => getParentTierName(tier) == null);
  const tierChildren = getTierChildrenMap(tiers);
  let tierDependents = {};
  for (const indepTier of indepTiers) {
    const indepTierName = getTierName(indepTier);
    tierDependents[indepTierName] = getDescendants(indepTierName, tierChildren);
  }
  return tierDependents;
}

function getAnnotationIDMap(tiers) {
  const annotationsFromIDs = {};
  for (const tier of tiers) {
    for (const annotation of getAnnotations(tier)) {
      const annotationID = noteUtils.getInnerAnnotationID(noteUtils.unwrapAnnotation(annotation));
      annotationsFromIDs[annotationID] = annotation;
    }
  }
  return annotationsFromIDs;
}

// comparison function for timeslot IDs
function slotIDDiff(slot1, slot2) {
  return parseInt(slot1.slice(2)) - parseInt(slot2.slice(2));
}

/* return a map: independent_tier_id -> timeslot_id -> rank,
  where a timeslot's "rank" is what its index would be
  in a time-ordered array of the unique timeslots for this speaker */
function getTierTimeslotsMap(tiers) {
  const indepTiers = tiers.filter((tier) => getParentTierName(tier) == null);
  const tierDependents = getTierDependentsMap(tiers);
  const tierTimeslots = {};
  for (const indepTier of indepTiers) {
    const indepTierName = getTierName(indepTier);

    let slotsSet = getTimeslotSet(indepTier); // use a set to omit duplicates
    for (const maybeDepTier of tiers) {
      if (tierDependents[indepTierName].includes(getTierName(maybeDepTier))) {
        // maybeDepTier is a dependent of indepTier
        for (const slot of getTimeslotSet(maybeDepTier)) {
          slotsSet.add(slot);
        }
      }
    }
    const slotsArray = Array.from(slotsSet);

    // sort by the numerical part of the timeslot ID
    const sortedSlots = slotsArray.sort(slotIDDiff);

    // create a map from timeslot ID to its "rank" (its position in the sorted array)
    let slotRanks = {};
    for (const slotIndex in sortedSlots) {
      if (sortedSlots.hasOwnProperty(slotIndex)) {
        slotRanks[sortedSlots[slotIndex]] = slotIndex;
      }
    }
    tierTimeslots[indepTierName] = slotRanks;
  }
  return tierTimeslots;
}

// return true if tier has alignable annotations, false if it has ref annotations
function isTierAlignable(tier) {
  return noteUtils.isAnnotationAlignable(getAnnotations(tier)[0]);
}

// returns the ELAN-user-specified tier name (string)
function getTierName(tier) {
  return tier.$.TIER_ID;
}

// returns the ELAN-user-specified name of its parent-tier (string), or null if tier is independent
function getParentTierName(tier) {
  return tier.$.PARENT_REF;
}

// returns the ELAN-user-specified speaker's name (string or null)
function getTierSpeakerName(tier) {
  return tier.$.PARTICIPANT;
}

// returns the tier's language (a string), which is often an ISO code
function getTierLanguage(tier) {
  return tier.$.LANG_REF;
}

function getAnnotations(tier) {
  return tier.ANNOTATION;
}

// return the set of timeslotIDs referenced in this tier
function getTimeslotSet(tier) {
  if (!isTierAlignable(tier)) {
    // no timestamps in this tier; it's all REF_ANNOTATIONs
    return new Set();
  }
  const annotations = getAnnotations(tier);
  const startSlots = new Set(annotations.map((a) => noteUtils.getAlignableAnnotationStartSlot(a)));
  const endSlots = new Set(annotations.map((a) => noteUtils.getAlignableAnnotationEndSlot(a)));
  let allSlots = startSlots;
  for (const slot of endSlots) {
    allSlots.add(slot);
  }
  return allSlots;
}


module.exports = {

  isTierAlignable: isTierAlignable,
  getTierName: getTierName,
  getParentTierName: getParentTierName,
  getTierSpeakerName: getTierSpeakerName,
  getTierLanguage: getTierLanguage,
  getAnnotations: getAnnotations,
  // getTimeslotSet: getTimeslotSet,

  getDocTimeslotsMap: getDocTimeslotsMap,
  getNonemptyTiers: getNonemptyTiers,
  // getTierChildrenMap: getTierChildrenMap,
  getTierDependentsMap: getTierDependentsMap,
  getAnnotationIDMap: getAnnotationIDMap,
  slotIDDiff: slotIDDiff,
  getTierTimeslotsMap: getTierTimeslotsMap,
};