const fs = require('fs');

const storyFilesDir = "data/json_files/";
const indexFileName = "data/index.json"; // stores metadata for all documents
const dbFileName = "data/fake_database.json";

const db = {
    'index': JSON.parse(fs.readFileSync(indexFileName, 'utf8')),
    'stories': []
};

const storyFileNames = fs.readdirSync(storyFilesDir);
for (const storyFileName of storyFileNames) {
    console.log("Reading " + storyFileName);
    db['stories'].push(JSON.parse(fs.readFileSync(storyFilesDir + storyFileName, 'utf8')));
}

const dbPrettyString = JSON.stringify(db, null, 2);
fs.writeFileSync(dbFileName, dbPrettyString);
console.log("The fake database was updated.");
