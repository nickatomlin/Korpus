const fs = require('fs');
const util = require('util');
const parseString = require('xml2js').parseString; // or we could use simple-xml

const basePath = '../data/dict/';
const xmlFileName = basePath + 'dict.xml';
const jsonFileName = basePath + 'dict.json';

fs.readFile(xmlFileName, function (err, xml) {
	if (err) throw err;

	parseString(xml, function (err, jsonIn) {
		const entries = jsonIn.html.body[0].div; // Gets the list of dictionary entries
		for (const entry of entries) {
			const data = entry.span; // Ignores the metadata associated with each entry
			// Each of these "data" elements is a list (length 2-3 mostly, some 1s and 4s)
			//   - elements with class="letHead" are garbage. they were originally section headers in the dict.
			//     e.g., the header for words beginning with "A a" or "1".
			//     BUT: this also contains "headwords", not sure what those are.
			//   - class="mainheadword" contains the original word AFAIK
			//   - class="senses" contains the main info for the word.
			if (!(data.length === 1 && data[0]['$']['class'] === "letter")) { // removes letHead garbage
				if (entry['$']['class'] == "entry") {

				} else if (entry['$']['class'] == "minorentryvariant") {

				} else if (entry['$']['class'] == "minorentrycomplex") {

				} else {
					console.log("Something weird happened.");
				}
				// 4 types of div classes: entry, minorentryvariant, minorentrycomplex, letHead
			}
		}
	});
});