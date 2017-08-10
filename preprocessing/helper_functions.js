function verifyMedia(filename) {
	// I/P: filename, a .mp3 or .mp4 file
	// O/P: boolean, whether or not file exists in media_files directory
	// Status: untested
	const media_files = fs.readdirSync("data/media_files");
	return (media_files.indexOf(filename) >= 0);
}

function getMetadataFromIndex(filename) {
	// I/P: filename, an XML or EAF file
	// O/P: a JSON object with metadata for the given file;
	//      or null if filename not in index
	// Status: untested
	const index = JSON.parse(fs.readFileSync("data/index.json", "utf8"));
	if index.hasOwnProperty(filename) {
		return index[filename];
	} else {
		return null;
	}
}
