/* functions for accessing data within FLEx's format (except parsed to JSON): */

// returns a map from each timeslotID to its time value in ms
function getDocTimeslotsMap(doc) {
  const timeslotsIn = doc.ANNOTATION_DOCUMENT.TIME_ORDER[0].TIME_SLOT;
  let timeslots = [];
  for (const slot of timeslotsIn) {
    timeslots[slot.$.TIME_SLOT_ID] = slot.$.TIME_VALUE;
  }
  return timeslots;
}

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

// returns a list of tiers (JSON objects)
function getNonemptyTiers(doc) {
  const allTiers = doc.ANNOTATION_DOCUMENT.TIER;
  return allTiers.filter((tier) =>
      tier.ANNOTATION != null && tier.ANNOTATION.length > 0
  );
}

function getNearestTimedAncestor(bigAnnotation, bigAnnotationsFromIDs) {
  let currentBigAnnotation = bigAnnotation;
  while (currentBigAnnotation.ALIGNABLE_ANNOTATION == null) {
    const parentAnnotationID = currentBigAnnotation.REF_ANNOTATION[0].$.ANNOTATION_REF;
    currentBigAnnotation = bigAnnotationsFromIDs[parentAnnotationID];
  }
  return currentBigAnnotation.ALIGNABLE_ANNOTATION[0];
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

// return true if tier has alignable annotations, false if it has ref annotations
function tierIsAlignable(tier) {
  return tier.ANNOTATION[0].ALIGNABLE_ANNOTATION != null;
}

function getOuterAnnotations(tier) {
  return tier.ANNOTATION;
}

function getOuterAnnotationIDMap(tiers) {
  const bigAnnotationsFromIDs = {};
  for (const tier of tiers) {
    for (const bigAnnotation of getOuterAnnotations(tier)) {
      const annotationID = getInnerAnnotationID(unwrapAnnotation(bigAnnotation));
      bigAnnotationsFromIDs[annotationID] = bigAnnotation;
    }
  }
  return bigAnnotationsFromIDs;
}

function getInnerAnnotations(tier) {
  if (tierIsAlignable(tier)) {
    return tier.ANNOTATION.map(a => a.ALIGNABLE_ANNOTATION[0]);
  } else {
    return tier.ANNOTATION.map(a => a.REF_ANNOTATION[0]);
  }
}

function outerAnnotationIsAlignable(outerAnnotation) {
  return outerAnnotation.ALIGNABLE_ANNOTATION != null;
}

function unwrapAnnotation(outerAnnotation) {
  if (outerAnnotationIsAlignable(outerAnnotation)) {
    return outerAnnotation.ALIGNABLE_ANNOTATION[0];
  } else {
    return outerAnnotation.REF_ANNOTATION[0];
  }
}

function getOuterAnnotationValue(outerAnnotation) {
  return getInnerAnnotationValue(unwrapAnnotation(outerAnnotation));
}

function getOuterAnnotationStartSlot(outerAnnotation, bigAnnotationsFromIDs) {
  return getInnerAnnotationStartSlot(unwrapAnnotation(getNearestTimedAncestor(outerAnnotation, bigAnnotationsFromIDs)));
}

function getOuterAnnotationEndSlot(outerAnnotation, bigAnnotationsFromIDs) {
  return getInnerAnnotationEndSlot(unwrapAnnotation(getNearestTimedAncestor(outerAnnotation, bigAnnotationsFromIDs)));
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
  getDocTimeslotsMap: getDocTimeslotsMap,
  getTierChildrenMap: getTierChildrenMap,
  getNonemptyTiers: getNonemptyTiers,
  getNearestTimedAncestor: getNearestTimedAncestor,
  getParentTierName: getParentTierName,
  getTierName: getTierName,
  getTierSpeakerName: getTierSpeakerName,
  getTierLanguage: getTierLanguage,
  tierIsAlignable: tierIsAlignable,
  getOuterAnnotations: getOuterAnnotations,
  getOuterAnnotationIDMap: getOuterAnnotationIDMap,
  getInnerAnnotations: getInnerAnnotations,
  outerAnnotationIsAlignable: outerAnnotationIsAlignable,
  unwrapAnnotation: unwrapAnnotation,
  getOuterAnnotationValue: getOuterAnnotationValue,
  getOuterAnnotationStartSlot: getOuterAnnotationStartSlot,
  getOuterAnnotationEndSlot: getOuterAnnotationEndSlot,
  getInnerAnnotationID: getInnerAnnotationID,
  getInnerAnnotationValue: getInnerAnnotationValue,
  getInnerAnnotationStartSlot: getInnerAnnotationStartSlot,
  getInnerAnnotationEndSlot: getInnerAnnotationEndSlot,
};