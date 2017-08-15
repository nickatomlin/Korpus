/* not working yet; just a dumping ground for code that was used to manipulate the index in preprocess_flex.js */

// TITLE STUFF - NICK
let title = xmlFileName.substr(xmlFileName.lastIndexOf('/') + 1); // hides path to file name
title = title.slice(0, -4); // removes last four characters

let con_title = "";
let es_title = "";
let display_title = "";
const titles = jsonIn["document"]["interlinear-text"][0]["item"];
for (const current_title of titles) {
  if (current_title["$"]["type"] === "title" && current_title["$"]["lang"] === "con-Latn-EC") {
    // FIXME: This line causes Singo A'i to show up with title "a'i". Why is this even here?
    con_title = current_title["_"].substr(current_title["_"].indexOf(" ") + 1);
  }
  else if (current_title["$"]["type"] === "title" && current_title["$"]["lang"] === "es") {
    es_title = current_title["_"]
  }
}
if (es_title !== "") {
  display_title = con_title + " (" + es_title + ")";
} else {
  display_title = con_title;
}

jsonOut.metadata.title = con_title;
// END OF TITLE STUFF

const index = JSON.parse(fs.readFileSync(indexJsonFileName));

const indexMetadata = {"title from filename": title, "display_title": display_title};
index.push(indexMetadata);

const indexPrettyString = JSON.stringify(index, null, 2);
fs.writeFileSync(indexJsonFileName, indexPrettyString);
console.log("The index was updated.");