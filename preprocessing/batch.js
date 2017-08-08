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
const completionGate = {
    numJobs: 0,
    whenDone: function() {
        this.numJobs--;
        console.log(this.numJobs);
        if (this.numJobs === 0) {
            console.log("Building fake database...");
            db.build(jsonFilesDir, indexFileName, dbFileName);
        }
    }
};

function eaf_preprocess_dir(eafFilesDir, jsonFilesDir, isoFileName) {
    const eafFileNames = fs.readdirSync(eafFilesDir);
    for (const eafFileName of eafFileNames) {
        const eafPath = eafFilesDir + eafFileName;
        const jsonPath = jsonFilesDir + eafFileName.slice(0, -4) + ".json";
        completionGate.numJobs++;
        elan.preprocess(eafPath, jsonPath, eafFileName.slice(0, -4), completionGate.whenDone);
    }
}

const doElan = function() {
    eaf_preprocess_dir(elanFilesDir, jsonFilesDir, isoFileName);
};

flex.preprocess_dir(flexFilesDir, jsonFilesDir, isoFileName, doElan);
