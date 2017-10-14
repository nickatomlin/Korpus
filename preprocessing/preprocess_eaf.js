const fs = require('fs');
const parseXml = require('xml2js').parseString;
const eafUtils = require('./eaf_utils');
const helper = require('./helper_functions');

function updateIndex(indexMetadata, indexFileName, storyID) {
  let index = JSON.parse(fs.readFileSync(indexFileName, "utf8"));
  index[storyID] = indexMetadata;
  fs.writeFileSync(indexFileName, JSON.stringify(index, null, 2));
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

    const timeslots = eafUtils.getDocTimeslotsMap(adocIn);
    const tiers = eafUtils.getNonemptyTiers(adocIn);
    const indepTiers = tiers.filter((tier) => eafUtils.getParentTierName(tier) == null);
    const annotationsFromIDs = eafUtils.getAnnotationIDMap(tiers);

    // tierDependents: indep tier name -> list of dep tier names
    const tierDependents = eafUtils.getTierDependentsMap(tiers);

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

    /* tierTimeslots: independent_tier_id -> timeslot_id -> rank,
          where a timeslot's "rank" is what its index would be
          in an id-ordered array of the unique timeslots for this speaker */
    const tierTimeslots = eafUtils.getTierTimeslotsMap(tiers, tierIDsFromNames);

    for (let i = 0; i < indepTiers.length; i++) {
      const spkrID = "S" + (i + 1).toString();
      const indepTierName = eafUtils.getTierName(indepTiers[i]);
      //console.log("Indep tier " + indepTierName + ":");
      const tierID = tierIDsFromNames[indepTierName];

      jsonOut.metadata["speaker IDs"][spkrID] = {
        "name": eafUtils.getTierSpeakerName(indepTiers[i]),
        "language": eafUtils.getTierLanguage(indepTiers[i]),
        "tier": tierID,
      };

      const depTiers = tiers.filter((tier) =>
          tierDependents[indepTierName].includes(eafUtils.getTierName(tier))
      );

      for (const annotation of eafUtils.getAnnotations(indepTiers[i])) {
        const iStartTimeslot = eafUtils.getAlignableAnnotationStartSlot(annotation);
        const iEndTimeslot = eafUtils.getAlignableAnnotationEndSlot(annotation);
        const iStartRank = parseInt(tierTimeslots[indepTierName][iStartTimeslot], 10);
        const iEndRank = parseInt(tierTimeslots[indepTierName][iEndTimeslot], 10);

        const indepTierJson = {
          "speaker": spkrID,
          "tier": tierID,
          "start_time_ms": parseInt(timeslots[iStartTimeslot], 10),
          "end_time_ms": parseInt(timeslots[iEndTimeslot], 10),
          "num_slots": iEndRank - iStartRank,
          "text": eafUtils.getAnnotationValue(annotation),
          "dependents": [],
        };

        for (const depTier of depTiers) {
          const depTierJson = {
            "tier": tierIDsFromNames[eafUtils.getTierName(depTier)],
            "values": [],
          };

          for (const annotation of eafUtils.getAnnotations(depTier)) {
            const dStartTimeslot = eafUtils.getAnnotationStartSlot(annotation, annotationsFromIDs);
            const dEndTimeslot = eafUtils.getAnnotationEndSlot(annotation, annotationsFromIDs);

            // FIXME this is probably the reason annotations disappear on Frankensteins
            if (eafUtils.slotIDDiff(dStartTimeslot, iStartTimeslot) >= 0
                && eafUtils.slotIDDiff(iEndTimeslot, dEndTimeslot) >= 0) {
              // this dependent annotation goes with the current independent annotation

              const dStartRank = parseInt(tierTimeslots[indepTierName][dStartTimeslot], 10);
              const dEndRank = parseInt(tierTimeslots[indepTierName][dEndTimeslot], 10);
              depTierJson.values.push({
                "start_slot": dStartRank - iStartRank,
                "end_slot": dEndRank - iStartRank,
                "value": eafUtils.getAnnotationValue(annotation),
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
