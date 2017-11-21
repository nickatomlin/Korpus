/* for testing/development only; edit and run this to do only the relevant part of preprocessing */

const fs = require('fs');
const parseXml = require('xml2js').parseString;
const flex = require('./preprocess_flex');
const elan = require('./preprocess_eaf');
const db = require('./build_fake_database');

const flexFilesDir = "data/flex_files2/";
const elanFilesDir = "data/elan_files/";
const jsonFilesDir = "data/json_files/";
const isoFileName = "preprocessing/iso_dict.json";
const indexFileName = "data/index2.json"; // stores metadata for all documents
const dbFileName = "data/fake_database.json";

//console.log("Converting all files to .JSON and re-building the database. The index and metadata will also be updated during this process. Status messages will appear below:")

const annotationChildren = {
  'root':{
    'T1':['c1a','c1b','c1c'],
    'T2':['c2'], // child is correctly stretched
  },
  'c2':{
    'T4':['c4'], // FIXME grandchild not stretched (endslot is 1, should be 3)
  }
};

const tiersToConstraints = {
  'T0': '', 
  'T1': 'Symbolic_Subdivision', 
  'T2': 'Symbolic_Association',
  'T4': 'Symbolic_Association'
};

const annotationsFromIDs = {
  'root': {"ALIGNABLE_ANNOTATION": [
      {
        "$": {
          "ANNOTATION_ID": "root",
          "TIME_SLOT_REF1": "ts1",
          "TIME_SLOT_REF2": "ts8"
        },
        "ANNOTATION_VALUE": [
          "parsnip"
        ]
      }
    ]
  },
  'c1a': {"REF_ANNOTATION": [
      {
        "$": {
          "ANNOTATION_ID": "c1a",
          "ANNOTATION_REF": "root"
        },
        "ANNOTATION_VALUE": [
          "aardvark"
        ]
      }
    ]
  },
  'c1b': {"REF_ANNOTATION": [
      {
        "$": {
          "ANNOTATION_ID": "c1b",
          "ANNOTATION_REF": "root",
          "PREVIOUS_ANNOTATION": "c1a"
        },
        "ANNOTATION_VALUE": [
          "boy"
        ]
      }
    ]
  },
  'c1c': {"REF_ANNOTATION": [
      {
        "$": {
          "ANNOTATION_ID": "c1c",
          "ANNOTATION_REF": "root",
          "PREVIOUS_ANNOTATION": "c1b"
        },
        "ANNOTATION_VALUE": [
          "cat"
        ]
      }
    ]
  },
  'c2': {"REF_ANNOTATION": [
      {
        "$": {
          "ANNOTATION_ID": "c2",
          "ANNOTATION_REF": "root",
        },
        "ANNOTATION_VALUE": [
          "rogue"
        ]
      }
    ]
  },
  'c4': {"REF_ANNOTATION": [
      {
        "$": {
          "ANNOTATION_ID": "c4",
          "ANNOTATION_REF": "c2",
        },
        "ANNOTATION_VALUE": [
          "orphan"
        ]
      }
    ]
  },
}

const timeslots = {'ts1':0,'ts8':8000};

const startSlots = {};
const endSlots = {};

console.log(annotationChildren['c2']); // this is fine
elan.assignSlots('root', tiersToConstraints,
    annotationChildren, annotationsFromIDs, timeslots, startSlots, endSlots)
console.log(startSlots);
console.log(endSlots);
