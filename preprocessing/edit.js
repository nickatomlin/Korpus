let fs = require('fs');
let prompt = require('prompt');
let obj = JSON.parse(fs.readFileSync('data/index2.json', 'utf8'));

let filename;

process.argv.forEach(function (val, index, array) {
	if (index === 2) {
		filename = val;
	} else if (index === 3) {
		console.log("Too many arguments. Continuing anyway...");
	}
});

console.log(obj[filename]);