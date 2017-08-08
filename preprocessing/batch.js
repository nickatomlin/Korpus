const flex = require('./preprocess_flex');
const elan = require('./preprocess_eaf');
const db = require('./build_fake_database');

const flexFilesDir = "data/flex_files/";
const elanFilesDir = "data/elan_files/";
const jsonFilesDir = "data/json_files/";
const isoFileName = "preprocessing/iso_dict.json";
const indexFileName = "data/index.json"; // stores metadata for all documents
const dbFileName = "data/fake_database.json";

// use this to wait for things to terminate before executing the callback
const status = {numJobs: 2};
const whenDone = function() {
    console.log("job done");
    status.numJobs--;
    if (status.numJobs === 0) {
        console.log("Building fake database...");
        db.build(jsonFilesDir, indexFileName, dbFileName);
    }
};

elan.preprocess_dir(elanFilesDir, jsonFilesDir, whenDone);
flex.preprocess_dir(flexFilesDir, jsonFilesDir, isoFileName, whenDone);
