const flex = require('./preprocess_flex');

const xmlFilesDir = "data/flex_files/";
const jsonFilesDir = "data/json_files/";
// const indexJsonFileName = "data/index.json"; // stores metadata for all documents
const isoFileName = "preprocessing/iso_dict.json";

// TODO validate index
flex.preprocess_dir(xmlFilesDir, jsonFilesDir, isoFileName);
// TODO elan.preprocess_dir


