/* Run this script from the main directory (Korpus) */

const fs = require('fs');
const util = require('util');
const parseXml = require('xml2js').parseString; // or we could use simple-xml
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
    if (tier.ANNOTATION[0].ALIGNABLE_ANNOTATION == null) {
        // no timestamps in this tier; it's all `REF_ANNOTATION`s
        return new Set();
    }
    const annotations = tier.ANNOTATION.map((a) => a.ALIGNABLE_ANNOTATION[0]);
    const startSlots = new Set(annotations.map((a) => a.$.TIME_SLOT_REF1));
    const endSlots = new Set(annotations.map((a) => a.$.TIME_SLOT_REF2));
    for (const slot of endSlots) {
        startSlots.add(slot);
    }
    return startSlots;
}

const slotIdDiff = function(s1, s2) {
    return parseInt(s1.slice(2)) - parseInt(s2.slice(2));
};

function preprocess(xmlFileName, jsonFileName, titleFromFileName, callback) {
    parseXml(fs.readFileSync(xmlFileName), function (err, jsonIn) {

        const timeslotsIn = jsonIn.ANNOTATION_DOCUMENT.TIME_ORDER[0].TIME_SLOT;
        const timeslots = [];
        for (const slot of timeslotsIn) {
            timeslots[slot.$.TIME_SLOT_ID] = slot.$.TIME_VALUE;
        }

        const jsonOut = {
            "metadata": {},
            "sentences": []
        };

        /////////////////////////////////////////
        // Nick's index-updating code begins here
        /////////////////////////////////////////
        let metadata = helper.improveElanIndexData(xmlFileName, jsonIn.ANNOTATION_DOCUMENT);
        jsonOut.metadata = metadata;
        jsonOut.metadata["tier IDs"] = {};
        jsonOut.metadata["speaker IDs"] = {};

        // update the index.json file
        let index = JSON.parse(fs.readFileSync("data/index2.json", "utf8"));
        index[helper.getFilenameFromPath(xmlFileName)] = metadata;
        fs.writeFileSync("data/index2.json", JSON.stringify(index, null, 2));
        ///////////////////////////////////////
        // Nick's index-updating code ends here
        ///////////////////////////////////////

        // let title = xmlFileName.substr(xmlFileName.lastIndexOf('/') + 1); // hides path to file name
        // title = title.slice(0, -4); // removes last four characters
        // jsonOut.metadata.title = title; // sets title

        const tiersIncludeEmpty = jsonIn.ANNOTATION_DOCUMENT.TIER;
        // discard tiers that have no annotations in them
        const tiers = tiersIncludeEmpty.filter((tier) =>
            tier.ANNOTATION != null && tier.ANNOTATION.length > 0);

        const tierChildren = {};
        for (const tier of tiers) {
            const parentName = tier.$.PARENT_REF;
            if (parentName != null) {
                if (tierChildren[parentName] == null) {
                    tierChildren[parentName] = [];
                }
                tierChildren[parentName].push(tier.$.TIER_ID);
            }
        }

        const tierNames = tiers.map((tier) => tier.$.TIER_ID);
        for (let i = 0; i < tierNames.length; i++) {
            const newID = "T" + (i + 1).toString();
            jsonOut.metadata["tier IDs"][newID] = tierNames[i];
        }
        const tierIDsFromNames = swapJsonKeyValues(jsonOut.metadata["tier IDs"]);
        const indepTiers = tiers.filter((tier) => tier.$.PARENT_REF == null);

        // tierDependents: indep tier name -> list of dep tier names
        const tierDependents = {};
        for (const indepTier of indepTiers) {
            const indepTierName = indepTier.$.TIER_ID;
            tierDependents[indepTierName] = getDescendants(indepTierName, tierChildren);
        }

        /* tierTimeslots: independent_tier_id -> timeslot_id -> rank,
          where a timeslot's "rank" is what its index would be
          in a time-ordered array of the unique timeslots for this speaker */
        const tierTimeslots = {};
        for (const indepTier of indepTiers) {
            const indepTierName = indepTier.$.TIER_ID;
            const indepTierID = tierIDsFromNames[indepTierName];

            const slots = getTimeslotSet(indepTier);
            const depTiers = tiers.filter((tier) =>
                tierDependents[indepTierName].includes(tier.$.TIER_ID)
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

        const bigAnnotationsFromIDs = {};
        for (const tier of tiers) {
            if (tier.ANNOTATION[0].ALIGNABLE_ANNOTATION != null) {
                for (const bigAnnotation of tier.ANNOTATION) {
                    const annotationID = bigAnnotation.ALIGNABLE_ANNOTATION[0].$.ANNOTATION_ID;
                    bigAnnotationsFromIDs[annotationID] = bigAnnotation;
                }
            } else {
                // REF_ANNOTATIONs
                for (const bigAnnotation of tier.ANNOTATION) {
                    const annotationID = bigAnnotation.REF_ANNOTATION[0].$.ANNOTATION_ID;
                    bigAnnotationsFromIDs[annotationID] = bigAnnotation;
                }
            }
        }

        for (let i = 0; i < indepTiers.length; i++) {

            const spkrID = "S" + (i + 1).toString();
            const indepTierName = indepTiers[i].$.TIER_ID;
            const spkrName = indepTiers[i].$.PARTICIPANT;
            const language = indepTiers[i].$.LANG_REF;
            const tierID = tierIDsFromNames[indepTierName];

            jsonOut.metadata["speaker IDs"][spkrID] = {
                "name": spkrName,
                "language": language,
                "tier": tierID
            };

            const depTiers = tiers.filter((tier) =>
                tierDependents[indepTierName].includes(tier.$.TIER_ID)
            );

            for (const bigAnnotation of indepTiers[i].ANNOTATION) {
                const annotation = bigAnnotation.ALIGNABLE_ANNOTATION[0];

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
                    const depTierID = tierIDsFromNames[depTier.$.TIER_ID];
                    const depTierJson = {
                        "tier": depTierID,
                        "values": []
                    };

                    for (const bigAnnotation of depTier.ANNOTATION) {
                        let value;
                        if (bigAnnotation.ALIGNABLE_ANNOTATION != null) {
                            value = bigAnnotation.ALIGNABLE_ANNOTATION[0].ANNOTATION_VALUE[0];
                        } else {
                            value = bigAnnotation.REF_ANNOTATION[0].ANNOTATION_VALUE[0];
                        }

                        let currentBigAnnotation = bigAnnotation;
                        while (currentBigAnnotation.ALIGNABLE_ANNOTATION == null) {
                            const parentAnnotationID = currentBigAnnotation.REF_ANNOTATION[0].$.ANNOTATION_REF;
                            currentBigAnnotation = bigAnnotationsFromIDs[parentAnnotationID];
                        }
                        const timeAnnotation = currentBigAnnotation.ALIGNABLE_ANNOTATION[0];

                        const d_start_timeslot = timeAnnotation.$.TIME_SLOT_REF1;
                        const d_end_timeslot = timeAnnotation.$.TIME_SLOT_REF2;
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
    const whenDone = function() {
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
