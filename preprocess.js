var fs = require('fs');
var util = require('util');

var xmlFileName = "C:\\xampp\\htdocs\\ETST\\elan_text_sync_tool\\elan_files\\test1.eaf";
var jsonFileName = "C:\\Users\\Kalinda\\Documents\\MEGAsync\\Linguistics\\UTRA\\data_conversion\\test1_json_out.js"

var test1xml; 

fs.readFile(xmlFileName, function (err, xml) {
  if (err) throw err;
  console.log(xml);

  var parseString = require('xml2js').parseString;
  //var xml = "<root>Hello xml2js!</root>"
  parseString(xml, function (err, json) {
	console.dir(json);
	
	prettyString = JSON.stringify(json, null, 2);
	fs.writeFile(jsonFileName, prettyString, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
	}); 
  });
});

