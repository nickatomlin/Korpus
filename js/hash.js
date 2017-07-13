// For page navigation with window.location.hash

// I/P: none
// O/P: the decoded hash filename, minus the leading "#/"
// Status: untested
function getHash() {
	var encodedFileName = window.location.hash;
	return decodeURI(encodedFileName.substring(2));
}

// I/P: fileName, the decoded name of a file
// O/P: a function should be called, depending on the name of the file
// Status: untested
function checkPages(fileName) {
	if (fileName.substring(0,5) == "index") {
		showIndex();
	}
	else if (fileName.substring(0,5) == "story") {
		fileName = fileName.substring(6);
  		displayText(fileName);
	}
}

function update() {
	var fileName = getHash();
 	checkPages(fileName);
}

$(window).on('hashchange', function() {
  update();
}).trigger('hashchange');

update();