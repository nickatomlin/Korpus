/* for testing/development only; edit and run this to do only the relevant part of preprocessing */

const fs = require('fs');
const parseXml = require('xml2js').parseString;
const flex = require('./preprocess_flex');
const elan = require('./preprocess_eaf');
const db = require('./build_fake_database');

const flexFilesDir = "data/flex_files2/";
const elanFilesDir = "data/elan_files2/";
const jsonFilesDir = "data/json_files/";
const isoFileName = "preprocessing/iso_dict.json";
const indexFileName = "data/index2.json"; // stores metadata for all documents
const dbFileName = "data/fake_database.json";

console.log("Converting all files to .JSON and re-building the database. The index and metadata will also be updated during this process. Status messages will appear below:")

const eafFileNames = ['flor_flanca_tiny.eaf'];

// use this to wait for things to terminate before executing the callback
const status = {numJobs: eafFileNames.length};
const whenDone = function () {
  // console.log("job done");
  status.numJobs--;
  if (status.numJobs === 0) {
    // console.log("Building fake database...");
    db.build(jsonFilesDir, indexFileName, dbFileName);
  }
};

for (const eafFileName of eafFileNames) {
  console.log("Processing " + eafFileName);
  const eafPath = elanFilesDir + eafFileName;
  fs.readFile(eafPath, function (err1, xmlData) {
    if (err1) throw err1;
    parseXml(xmlData, function (err2, jsonData) {
      if (err2) throw err2;
      const adoc = jsonData.ANNOTATION_DOCUMENT
      elan.preprocess(adoc, jsonFilesDir, eafFileName, whenDone);
    });
  });
}
