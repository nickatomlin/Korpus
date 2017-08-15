/* not working yet; just a dumping ground for code that was used to manipulate the index in preprocess_eaf.js */

fs.readFile(indexJsonFileName, function (err, rawText) {
  if (err) {
    return console.log(err);
  }
  const index = JSON.parse(rawText);
  const indexMetadata = {"title from filename": title};
  index.push(indexMetadata);
  const prettyString2 = JSON.stringify(index, null, 2);
  fs.writeFile(indexJsonFileName, prettyString2, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The index was updated.");
  });
});
