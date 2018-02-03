const fs = require('fs');

function build(storyFilesDir, indexFileName, dbFileName) {
  const db = {
    'index': JSON.parse(fs.readFileSync(indexFileName, 'utf8')),
    'stories': []
  };

  const storyFileNames = fs.readdirSync(storyFilesDir).filter(f => f[0] != "."); // excludes hidden files
  for (const storyFileName of storyFileNames) {
    // console.log("Reading " + storyFileName);
    db['stories'].push(JSON.parse(fs.readFileSync(storyFilesDir + storyFileName, 'utf8')));
  }

  const dbPrettyString = JSON.stringify(db, null, 2);
  fs.writeFileSync(dbFileName, dbPrettyString);
  console.log("📤  The database was updated.");
}

module.exports = {
  build: build
};
