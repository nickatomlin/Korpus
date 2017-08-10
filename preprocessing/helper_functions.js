const fs = require('fs');

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
	// Status: tested, working
	const index = JSON.parse(fs.readFileSync("data/index2.json", "utf8"));
	if (index.hasOwnProperty(filename)) {
		return index[filename];
	} else {
		return null;
	}
}

function getFilenameFromPath(path) {
	// I/P: path, a string
	// O/P: the filename which occurs at the end of the path
	// Status: untested
	const begin = path.lastIndexOf("/") + 1; // @Kalinda, this might fail on windows.
	return path.substring(begin, path.length);
}

function improveFLExIndexData(path, itext) {
	// I/P: path, a string
	//      itext, an interlinear text, e.g., jsonIn["document"]["interlinear-text"][0]
	// O/P: a JSON object, based on the index.json file and new metadata
	// Status: untested
	const filename = getFilenameFromPath(path);
    const shortFilename = filename.substring(0, filename.lastIndexOf('.'));
    console.log("shortFilename is " + shortFilename);
    let metadata = getMetadataFromIndex(filename);

    const date = new Date();
    const prettyDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();

    if (metadata == null) { // file not in index previously
    	// below is the starter data:
        metadata = {
            "timed": false,
            "title from filename": shortFilename,
            "title": {
                "_default": ""
            },
            "media": {
                "audio": "",
                "video": ""
            },
            "languages": [],
            "date_created": "",
            "date_uploaded": prettyDate,
            "source": {
                "_default": ""
            },
            "description": "",
            "genre": "",
            "author": "",
            "glosser": "",
            "speakers": []
        }
    }
    // get title/source info
    const titlesAndSources = itext["item"];
    let titles = {};
    let sources = {};
    for (const current_title of titlesAndSources) {
        if (current_title['$']['type'] === 'title') {
            titles[(current_title["$"]["lang"])] = current_title["_"];
        } else if (current_title['$']['type'] === 'source') {
            sources[(current_title["$"]["lang"])] = current_title["_"];
        }
    }
    titles["_default"] = metadata["title"]["_default"];
    sources["_default"] = metadata["source"]["_default"];
    metadata["title"] = titles;
    metadata["source"] = sources;

    // get language info
    let languages = [];
    const languageData = itext["languages"][0]["language"];
    for (const language of languageData) {
        languages.push(language["$"]["lang"])
    }
    metadata["languages"] = languages;
    return metadata;
}

function improveElanIndexData(path, adoc) {
    // I/P: path, a string
    //      adoc, an annotation document
    // O/P: a JSON object, based on the index.json file and new metadata
    // Status: untested
    const filename = getFilenameFromPath(path);
    const shortFilename = filename.substring(0, filename.lastIndexOf('.'));
    console.log("shortFilename is " + shortFilename);
    let metadata = getMetadataFromIndex(filename);

    const date = new Date();
    const prettyDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();

    if (metadata == null) { // file not in index previously
        // below is the starter data:
        metadata = {
            "timed": true,
            "title from filename": filename,
            "title": {
                "_default": ""
            },
            "media": {
                "audio": "",
                "video": ""
            },
            "languages": [],
            "date_created": "",
            "date_uploaded": prettyDate,
            "source": {
                "_default": ""
            },
            "description": "",
            "genre": "",
            "author": "",
            "glosser": "",
            "speakers": []
        }
    }
    // get title/source info
    if (metadata['title']['_default'] === '') {
        metadata['title']['_default'] = shortFilename
    }

    // get language info
    let speakers = [];
    const tiers = adoc['TIER']
    for (const tier of tiers) {
        speakers.push(tier['$']['PARTICIPANT']);
    }
    metadata['speakers'] = speakers;

    const audioFile = metadata['media']['audio'];
    const hasWorkingAudio = verifyMedia(audioFile);
    const videoFile = metadata['media']['video'];
    const hasWorkingVideo = verifyMedia(videoFile);
    if (!hasWorkingAudio || !hasWorkingVideo) {
        const mediaDescriptors = adoc['HEADER'][0]['MEDIA_DESCRIPTOR'];
        for (const mediaDesc of mediaDescriptors) {
            let mediaUrl = mediaDesc['$']['MEDIA_URL'];
            mediaUrl = getFilenameFromPath(mediaUrl);
            if (verifyMedia(mediaUrl)) {
                const fileExtension = mediaUrl.substring(lastIndexOf('.'));
                if (fileExtension === 'mp3') {
                    metadata['media']['audio'] = mediaUrl;
                } else if (fileExtension === 'mp4') {
                    metadata['media']['video'] = mediaUrl;
                }
            }
        }
    }


    return metadata;
}

module.exports = {
    verifyMedia: verifyMedia,
    getMetadataFromIndex: getMetadataFromIndex,
    getFilenameFromPath: getFilenameFromPath,
    improveFLExIndexData: improveFLExIndexData
};