
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
function getTimedAncestor(annotation, annotationsFromIDs) {
  let currentannotation = annotation;
  while (currentannotation.ALIGNABLE_ANNOTATION == null) {
    const parentAnnotationID = currentannotation.REF_ANNOTATION[0].$.ANNOTATION_REF;
    currentannotation = annotationsFromIDs[parentAnnotationID];
  }
  return currentannotation;
}

function getAnnotationStartSlot(annotation, annotationsFromIDs) {
  return getInnerAnnotationStartSlot(unwrapAnnotation(getTimedAncestor(annotation, annotationsFromIDs)));
}

function getAnnotationEndSlot(annotation, annotationsFromIDs) {
  return getInnerAnnotationEndSlot(unwrapAnnotation(getTimedAncestor(annotation, annotationsFromIDs)));
}

function getAlignableAnnotationStartSlot(annotation) {
  return getInnerAnnotationStartSlot(unwrapAnnotation(annotation));
}

function getAlignableAnnotationEndSlot(annotation) {
  return getInnerAnnotationEndSlot(unwrapAnnotation(annotation));
}


module.exports = {
  // getInnerAnnotationID: getInnerAnnotationID,
  // getInnerAnnotationValue: getInnerAnnotationValue,
  // getInnerAnnotationStartSlot: getInnerAnnotationStartSlot,
  // getInnerAnnotationEndSlot: getInnerAnnotationEndSlot,

  isAnnotationAlignable: isAnnotationAlignable,
  // unwrapAnnotation: unwrapAnnotation,
  getAnnotationID: getAnnotationID,
  getAnnotationValue: getAnnotationValue,
  getTimedAncestor: getTimedAncestor,
  getAnnotationStartSlot: getAnnotationStartSlot,
  getAnnotationEndSlot: getAnnotationEndSlot,
  getAlignableAnnotationStartSlot: getAlignableAnnotationStartSlot,
  getAlignableAnnotationEndSlot: getAlignableAnnotationEndSlot,
}