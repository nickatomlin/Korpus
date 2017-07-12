// https://stackoverflow.com/questions/21461102/converting-html-table-to-json
/*$('#convert-table').click( function() {
  var table = $('#example-table').tableToJSON();
  console.log(table);
  alert(JSON.stringify(table));  
});*/

// Fetch a URL and parse all it's tables into JSON, using a callback 
var tabletojson = require('tabletojson');
var fs = require('fs');

var url = 'https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes';
var fileNameOut = "C:\\Users\\Kalinda\\Documents\\GitHub\\Korpus\\preprocessing\\all_tables.json";

tabletojson.convertUrl(url, function(tablesAsJson) {
  var mainTable = tablesAsJson[1]; // we want the second table on this particular page
  // console.log(tablesAsJson);
  var prettyString = JSON.stringify(mainTable, null, 2);
  fs.writeFile(fileNameOut, prettyString, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("File was written.");
  });
});