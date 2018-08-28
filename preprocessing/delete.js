// 

const fs = require("fs");
const inquirer = require("inquirer");
let obj = JSON.parse(fs.readFileSync("data/index.json", "utf8"));
let DB = JSON.parse(fs.readFileSync("data/database.json", "utf8"));

let filename;
let data;

let maxArgIndex = 0;
process.argv.forEach(function (val, index, array) {
  maxArgIndex = index;
  if (index === 2) {
		filename = val;
	} 
});
if (maxArgIndex !== 2) {
	console.log("Wrong number of arguments! To delete a file, type: \n $ node preprocessing/delete.js storyID \nwhere the storyID can be found in the URL or index.json file.");
} else {
	main();
}

function main() {
try {

	audio_filename = "";
	video_filename = "";
	// Get associated media:
	media = obj[filename]["media"]
	if (media.hasOwnProperty('audio') && media['audio'] !== '') {
		audio_filename = "data/media_files/" +  media['audio'];
	}
	if (media.hasOwnProperty('video') && media['video'] !== '') {
		video_filename = "data/media_files/" +  media['video'];
	}

	///////////////////////////////////
	// Ask to delete video/audio files:
	///////////////////////////////////
	inquirer.prompt([
		// mp3
		{
			"type": "confirm", 
			"name": "delete_audio",
			"message": "Found matching audio file: " + media['audio'] + ". Do you want to delete this file? If this audio file is used by other FLEx/ELAN files, it will be deleted there, too.",
			"default": false,
			"when": 
				function(answers) {
					if (audio_filename !== "") {
						return true;
					} else {
						return false;
					}
				}
		},
		{
			"type": "confirm", 
			"name": "delete_video",
			"message": "Found matching video file: " + media['video'] + ". Do you want to delete this file? If this video file is used by other FLEx/ELAN files, it will be deleted there, too.",
			"default": false,
			"when": 
				function(answers) {
					if (video_filename !== "") {
						return true;
					} else {
						return false;
					}
				}
		}
	]).then(function (answers) {
		if (answers["delete_audio"]) {
			fs.unlink(audio_filename, function(){}); 
		}
		if (answers["delete_video"]) {
			fs.unlink(video_filename, function(){}); 
		}
	});
	///////////////////////////////////
	// End inquirer
	///////////////////////////////////

	// Get original XML filename:
	xmlFileName = obj[filename]["xml_file_name"]
	if (obj[filename]["source_filetype"] === "ELAN") {
		fs.unlink("data/elan_files/" + xmlFileName, function(){});
	} else if (obj[filename]["source_filetype"] === "FLEx") {
		fs.unlink("data/flex_files/" + xmlFileName, function(){});
	} else {
		console.log("Unsure of filetype. Unable to delete original XML file.")
	}

	// Removes the index:
	delete obj[filename];

	// Removes story gloss from the database:
	stories = DB["stories"];
	for (i=0; i<stories.length; i++) {
		story = stories[i];
		if (story["metadata"]["story ID"] === filename) {
			DB["stories"].splice(i,1); // Delete the ith entry
		}
	}

	// Deletes the JSON file
	json_path = "data/json_files/" + filename + ".json";
	fs.unlink(json_path, function(){});
	
	fs.writeFileSync("data/index.json", JSON.stringify(obj, null, 2));
	DB["index"] = obj;
	fs.writeFileSync("data/database.json", JSON.stringify(DB, null, 2));
	console.log("✅" + "  " + "File successfully deleted!");
	console.log("\nYou've successfully deleted this file. However, this will not be displayed on the index until you run the rebuild.js script. You can run this script from the root directory with the command 'node preprocessing/rebuild.js'. We recommend doing this immediately.");
} catch(err) {
	console.log("❌" + "  " + "Deletion failed.");
}}
