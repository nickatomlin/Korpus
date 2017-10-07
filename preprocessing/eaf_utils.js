/* functions for accessing data within FLEx's format (except parsed to JSON): */

// adoc - an annotation document
// returns the hexadecimal code from the URN, or null if none was found
function getDocID(adoc) {
  const properties = adoc.HEADER[0].PROPERTY;
  for (const property of properties) {
    if (property.$.NAME === 'URN') {
      const urn = property._;
      return urn.substring(urn.lastIndexOf(':') + 1);
    }
  }
  return null;
}

// adoc - an annotation document
// returns a map from each timeslotID to its time value in ms
function getDocTimeslotsMap(adoc) {
  const timeslotsIn = adoc.TIME_ORDER[0].TIME_SLOT;
  let timeslots = [];
  for (const slot of timeslotsIn) {
    timeslots[slot.$.TIME_SLOT_ID] = slot.$.TIME_VALUE;
  }
  return timeslots;
}

// adoc - an annotation document
// returns a list of tiers (JSON objects)
function getNonemptyTiers(adoc) {
  const allTiers = adoc.TIER;
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
      const annotationID = getInnerAnnotationID(unwrapAnnotation(annotation));
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
  return getAnnotations(tier)[0].ALIGNABLE_ANNOTATION != null;
}

function isTierSubdivided(tierName, tiers) { // true iff tierName has a dependent, aligned ancestor tier
  return getParentTierName(getTierAlignedAncestor(tierName, tiers)) != null;
}

function getTierAlignedAncestor(tierName, tiers) {
  let currentTier = tiers.find(tier => getTierName(tier) === tierName);
  while (!isTierAlignable(currentTier)) {
    currentTier = tiers.find(tier => getTierName(tier) === getParentTierName(currentTier));
  }
  return currentTier;
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
  const startSlots = new Set(annotations.map((a) => getAlignableAnnotationStartSlot(a)));
  const endSlots = new Set(annotations.map((a) => getAlignableAnnotationEndSlot(a)));
  let allSlots = startSlots;
  for (const slot of endSlots) {
    allSlots.add(slot);
  }
  return allSlots;
}

function isAnnotationAlignable(annotation) {
  return annotation.ALIGNABLE_ANNOTATION != null;
}

function unwrapAnnotation(annotation) {
  if (isAnnotationAlignable(annotation)) {
    return annotation.ALIGNABLE_ANNOTATION[0];
  } else {
    return annotation.REF_ANNOTATION[0];
  }
}

function getAnnotationID(annotation) {
  return getInnerAnnotationID(unwrapAnnotation(annotation));
}

function getAnnotationValue(annotation) {
  return getInnerAnnotationValue(unwrapAnnotation(annotation));
}

// returns an annotation with the same start and end timeslots as this annotation
function getAnnotationTimedAncestor(annotation, annotationsFromIDs) {
  let currentannotation = annotation;
  while (currentannotation.ALIGNABLE_ANNOTATION == null) {
    const parentAnnotationID = currentannotation.REF_ANNOTATION[0].$.ANNOTATION_REF;
    currentannotation = annotationsFromIDs[parentAnnotationID];
  }
  return currentannotation;
}

function getAnnotationStartSlot(annotation, annotationsFromIDs) {
  return getInnerAnnotationStartSlot(unwrapAnnotation(getAnnotationTimedAncestor(annotation, annotationsFromIDs)));
}

function getAnnotationEndSlot(annotation, annotationsFromIDs) {
  return getInnerAnnotationEndSlot(unwrapAnnotation(getAnnotationTimedAncestor(annotation, annotationsFromIDs)));
}

function getAlignableAnnotationStartSlot(annotation) {
  return getInnerAnnotationStartSlot(unwrapAnnotation(annotation));
}

function getAlignableAnnotationEndSlot(annotation) {
  return getInnerAnnotationEndSlot(unwrapAnnotation(annotation));
}

function getInnerAnnotationID(innerAnnotation) {
  return innerAnnotation.$.ANNOTATION_ID;
}

function getInnerAnnotationValue(innerAnnotation) {
  return innerAnnotation.ANNOTATION_VALUE[0];
}

function getInnerAnnotationStartSlot(innerAnnotation) {
  return innerAnnotation.$.TIME_SLOT_REF1;
}

function getInnerAnnotationEndSlot(innerAnnotation) {
  return innerAnnotation.$.TIME_SLOT_REF2;
}

module.exports = {
  getDocID: getDocID,
  getDocTimeslotsMap: getDocTimeslotsMap,
  getNonemptyTiers: getNonemptyTiers,
  // getTierChildrenMap: getTierChildrenMap,
  getTierDependentsMap: getTierDependentsMap,
  getAnnotationIDMap: getAnnotationIDMap,
  slotIDDiff: slotIDDiff,
  // getTierNamesMap: getTierNamesMap,
  getTierTimeslotsMap: getTierTimeslotsMap,

  // isTierAlignable: isTierAlignable,
  isTierSubdivided: isTierSubdivided,
  // getTierAlignedAncestor: getTierAlignedAncestor,
  getTierName: getTierName,
  getParentTierName: getParentTierName,
  getTierSpeakerName: getTierSpeakerName,
  getTierLanguage: getTierLanguage,
  getAnnotations: getAnnotations,
  // getTimeslotSet: getTimeslotSet,

  isAnnotationAlignable: isAnnotationAlignable,
  // unwrapAnnotation: unwrapAnnotation,
  getAnnotationID: getAnnotationID,
  getAnnotationValue: getAnnotationValue,
  // getAnnotationTimedAncestor: getAnnotationTimedAncestor,
  getAnnotationStartSlot: getAnnotationStartSlot,
  getAnnotationEndSlot: getAnnotationEndSlot,
  getAlignableAnnotationStartSlot: getAlignableAnnotationStartSlot,
  getAlignableAnnotationEndSlot: getAlignableAnnotationEndSlot,

  // getInnerAnnotationValue: getInnerAnnotationValue,
  // getInnerAnnotationStartSlot: getInnerAnnotationStartSlot,
  // getInnerAnnotationEndSlot: getInnerAnnotationEndSlot,
};