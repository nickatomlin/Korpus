const fs = require("fs");
const prompt = require("prompt");
const inquirer = require("inquirer"); // Nick edited the node module for this
let obj = JSON.parse(fs.readFileSync("data/index2.json", "utf8"));

let filename;
let data;

process.argv.forEach(function (val, index, array) {
	if (index === 2) {
		filename = val;
	} else if (index === 3) {
		console.log("Too many arguments. Continuing anyway...");
	}
});

try {
	data = obj[filename];
	main(update);
	console.log("✅" + "  " + "File found! Preparing to edit...");
} catch (err) {
	console.log("❌" + "  " + " File not found! Exiting...");
}

// Information that can be changed via edit.js:
const editables = [
	"mp3",
	"mp4",
	"description",
	"genre",
	"author",
	"glosser",
	"date_created",
	"source"
]

function main(callback) {
	inquirer.prompt([
		// mp3
		{
			"type": "input",
			"name": "mp3",
			"message": "Name of mp3 file:",
			"default": data["mp3"],
			"when":
				function(answers) {
					return (data["timed"]);
				},
			"validate":	
				function(response) {
					const media_files = fs.readdirSync("data/media_files");
					if (media_files.indexOf(response) >= 0 || response == "") {
						return true;
					} else if (response == "blank") {
						console.log("Leaving mp3 file blank...");
						return true;
					} else {
						return "That file doesn't exist in your media_files directory! Please be aware that filenames are case-sensitive and require an extension. Type 'blank' to leave the file blank.";
					}
				}
		},
		// mp4
		{
			"type": "input",
			"name": "mp4",
			"message": "Name of mp4 file:",
			"default": data["mp4"],
			"when":
				function(answers) {
					return (data["timed"]);
				},
			"validate":	
				function(response) {
					const media_files = fs.readdirSync("data/media_files");
					if (media_files.indexOf(response) >= 0 || response == "") {
						return true;
					} else if (response == "blank") {
						console.log("Leaving mp4 file blank...");
						return true;
					} else {
						return "That file doesn't exist in your media_files directory! Please be aware that filenames are case-sensitive and require an extension. Type 'blank' to leave the file blank.";
					}
				}
		},
		// edit description?
		{
			"type": "confirm", 
			"name": "desc_edit",
			"message": "Edit description?",
			"default": false,
			"when": 
				function(answers) {
					if (data["description"]) {
						console.log("You've already entered a description: " + '"' + data["description"] + '"');
						return true;
					} else {
						return false;
					}
				}
		},
		// description editor (probably using Vim)
		{
			"type": "editor", 
			"name": "description",
			"message": " ", // cannot be empty :(
			"default": data["description"],
			"when": 
				function(answers) {
					return (answers["desc_edit"]);
				}
		},
		// description creator
		{
			"type": "input", 
			"name": "description",
			"message": "Enter a description:",
			"when": 
				function(answers) {
					return (data["description"] == "");
				}
		},
		// genre
		{
			"type": "list", 
			"name": "genre",
			"message": "Select a genre:",
			"choices": ["Nonfiction", "Fiction"],
			"default": data["genre"]
		},
		// author
		{
			"type": "input", 
			"name": "author",
			"message": "Author:",
			"default": data["author"]
		},
		// glosser
		{
			"type": "input", 
			"name": "glosser",
			"message": "Who glossed it:",
			"default": data["glosser"]
		},
		// date recorded
		{
			"type": "input", 
			"name": "date_created",
			"message": "Date of creation (mm/dd/yyyy):",
			"default": data["date_created"]
		},
		// source
		{
			"type": "input", 
			"name": "source",
			"message": "Source:",
			"default": data["source"]
		}
	// 
	]).then(function (answers) {
		data["mp3"] = answers["mp3"];
		data["mp4"] = answers["mp4"];
		data["description"] = answers["description"];
		data["genre"] = answers["genre"];
		data["author"] = answers["author"];
		data["glosser"] = answers["glosser"];
		data["date_created"] = answers["date_created"];
		data["source"] = answers["source"];
		callback();
	});
}

function update() {
	fs.writeFileSync("data/index2.json", JSON.stringify(obj, null, 2), function(err) {
    	if(err) {
        	return console.log(err);
    	}
    	console.log("📤" + "  " + "Metadata edit complete.");
    });
}

