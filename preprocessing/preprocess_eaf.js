/* Run this script from the main directory (Korpus) */

const fs = require('fs');
const util = require('util');
const parseXml = require('xml2js').parseString; // or we could use simple-xml
const eafUtils = require('./eaf_utils');
const helper = require('./helper_functions');

function swapJsonKeyValues(input) {
  const output = {};
  for (const value in input) {
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
  let descendants = children[ancestor];
  for (const child of children[ancestor]) {
    descendants = descendants.concat(getDescendants(child, children));
  }
  return descendants;
}

function getTimeslotSet(tier) {
  if (!eafUtils.tierIsAlignable(tier)) {
    // no timestamps in this tier; it's all `REF_ANNOTATION`s
    return new Set();
  }
  const annotations = eafUtils.getInnerAnnotations(tier);
  const startSlots = new Set(annotations.map((a) => eafUtils.getInnerAnnotationStartSlot(a)));
  const endSlots = new Set(annotations.map((a) => eafUtils.getInnerAnnotationEndSlot(a)));
  for (const slot of endSlots) {
    startSlots.add(slot);
  }
  return startSlots;
}


const slotIdDiff = function (s1, s2) {
  return parseInt(s1.slice(2)) - parseInt(s2.slice(2));
};

function preprocess(xmlFileName, jsonFileName, titleFromFileName, callback) {
  parseXml(fs.readFileSync(xmlFileName), function (err, jsonIn) {

    const indexMetadata = helper.improveElanIndexData(xmlFileName, jsonIn.ANNOTATION_DOCUMENT);

    // update the index.json file
    let index = JSON.parse(fs.readFileSync("data/index2.json", "utf8"));
    index[helper.getFilenameFromPath(xmlFileName)] = indexMetadata;
    fs.writeFileSync("data/index2.json", JSON.stringify(index, null, 2));

    const jsonOut = {
      "metadata": indexMetadata,
      "sentences": []
    };
    jsonOut.metadata["tier IDs"] = {};
    jsonOut.metadata["speaker IDs"] = {};
    jsonOut.metadata["title from filename"] = titleFromFileName;

    const timeslots = eafUtils.getDocTimeslotsMap(jsonIn);

    const tiers = eafUtils.getNonemptyTiers(jsonIn);
    const tierChildren = eafUtils.getTierChildrenMap(tiers);

    const bigAnnotationsFromIDs = eafUtils.getOuterAnnotationIDMap(tiers);

    let tierIDsFromNames = {};
    for (let i = 0; i < tiers.length; i++) {
      const newID = "T" + (i + 1).toString();
      const tier = tiers[i];
      const tierName = eafUtils.getTierName(tier);
      jsonOut.metadata["tier IDs"][newID] = {
        name: tierName,
        subdivided: eafUtils.tierIsAlignable(tier),
      };
      tierIDsFromNames[tierName] = newID;
    }
    const indepTiers = tiers.filter((tier) => eafUtils.getParentTierName(tier) == null);

    // tierDependents: indep tier name -> list of dep tier names
    const tierDependents = {};
    for (const indepTier of indepTiers) {
      const indepTierName = eafUtils.getTierName(indepTier);
      tierDependents[indepTierName] = getDescendants(indepTierName, tierChildren);
    }


    /* tierTimeslots: independent_tier_id -> timeslot_id -> rank,
      where a timeslot's "rank" is what its index would be
      in a time-ordered array of the unique timeslots for this speaker */
    const tierTimeslots = {};
    for (const indepTier of indepTiers) {
      const indepTierName = eafUtils.getTierName(indepTier);
      const indepTierID = tierIDsFromNames[indepTierName];

      const slots = getTimeslotSet(indepTier);
      const depTiers = tiers.filter((tier) =>
          tierDependents[indepTierName].includes(eafUtils.getTierName(tier))
      );
      for (const depTier of depTiers) {
        for (slot of getTimeslotSet(depTier)) {
          slots.add(slot);
        }
      }

      const slotsArray = Array.from(slots);
      // sort by the numerical part of the timeslot ID
      const sorted_slots = slotsArray.sort(slotIdDiff);
      // create a map from timeslot ID to its "rank" (its position in the sorted array)
      tierTimeslots[indepTierID] = swapJsonKeyValues(sorted_slots);
    }

    for (let i = 0; i < indepTiers.length; i++) {

      const spkrID = "S" + (i + 1).toString();
      const indepTierName = eafUtils.getTierName(indepTiers[i]);
      const spkrName = eafUtils.getTierSpeakerName(indepTiers[i]);
      const language = eafUtils.getTierLanguage(indepTiers[i]);
      const tierID = tierIDsFromNames[indepTierName];

      jsonOut.metadata["speaker IDs"][spkrID] = {
        "name": spkrName,
        "language": language,
        "tier": tierID
      };

      const depTiers = tiers.filter((tier) =>
          tierDependents[indepTierName].includes(eafUtils.getTierName(tier))
      );

      for (const annotation of eafUtils.getInnerAnnotations(indepTiers[i])) {

        const i_start_timeslot = annotation.$.TIME_SLOT_REF1;
        const i_end_timeslot = annotation.$.TIME_SLOT_REF2;
        const i_start_time_ms = parseInt(timeslots[i_start_timeslot], 10);
        const i_end_time_ms = parseInt(timeslots[i_end_timeslot], 10);
        const i_start_slot = parseInt(tierTimeslots[tierID][i_start_timeslot], 10);
        const i_end_slot = parseInt(tierTimeslots[tierID][i_end_timeslot], 10);
        const num_slots = i_end_slot - i_start_slot;

        const indepTierJson = {
          "speaker": spkrID,
          "tier": tierID,
          "start_time_ms": i_start_time_ms,
          "end_time_ms": i_end_time_ms,
          "num_slots": num_slots,
          "text": annotation.ANNOTATION_VALUE[0],
          "dependents": []
        };

        for (const depTier of depTiers) {
          const depTierID = tierIDsFromNames[eafUtils.getTierName(depTier)];
          const depTierJson = {
            "tier": depTierID,
            "values": []
          };

          for (const bigAnnotation of depTier.ANNOTATION) {
            const value = eafUtils.getOuterAnnotationValue(bigAnnotation);

            const timeAnnotation = eafUtils.getNearestTimedAncestor(bigAnnotation, bigAnnotationsFromIDs);
            const d_start_timeslot = eafUtils.getInnerAnnotationStartSlot(timeAnnotation);
            const d_end_timeslot = eafUtils.getInnerAnnotationEndSlot(timeAnnotation);
            if (slotIdDiff(d_start_timeslot, i_start_timeslot) >= 0
                && slotIdDiff(i_end_timeslot, d_end_timeslot) >= 0) {
              // this dependent annotation goes with the current independent annotation

              const d_raw_start_slot = parseInt(tierTimeslots[tierID][d_start_timeslot], 10);
              const d_raw_end_slot = parseInt(tierTimeslots[tierID][d_end_timeslot], 10);
              const d_rel_start_slot = d_raw_start_slot - i_start_slot;
              const d_rel_end_slot = d_raw_end_slot - i_start_slot;

              depTierJson.values.push({
                "start_slot": d_rel_start_slot,
                "end_slot": d_rel_end_slot,
                "value": value
              });
            }
          }
          if (depTierJson.values.length > 0) {
            indepTierJson.dependents.push(depTierJson);
          }
        }
        jsonOut.sentences.push(indepTierJson);
      }
    }

    const prettyString = JSON.stringify(jsonOut, null, 2);
    fs.writeFileSync(jsonFileName, prettyString);
    console.log("✅  Processed " + titleFromFileName + ".eaf");
    callback();
  });
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
    const eafPath = eafFilesDir + eafFileName;
    const jsonPath = jsonFilesDir + eafFileName.slice(0, -4) + ".json";
    preprocess(eafPath, jsonPath, eafFileName.slice(0, -4), whenDone);
  }
}

module.exports = {
  preprocess_dir: preprocess_dir,
  preprocess: preprocess
};
