/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = __webpack_require__(11);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var randomFromSeed = __webpack_require__(12);

var ORIGINAL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
var alphabet;
var previousSeed;

var shuffled;

function reset() {
    shuffled = false;
}

function setCharacters(_alphabet_) {
    if (!_alphabet_) {
        if (alphabet !== ORIGINAL) {
            alphabet = ORIGINAL;
            reset();
        }
        return;
    }

    if (_alphabet_ === alphabet) {
        return;
    }

    if (_alphabet_.length !== ORIGINAL.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
    }

    var unique = _alphabet_.split('').filter(function(item, ind, arr){
       return ind !== arr.lastIndexOf(item);
    });

    if (unique.length) {
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
    }

    alphabet = _alphabet_;
    reset();
}

function characters(_alphabet_) {
    setCharacters(_alphabet_);
    return alphabet;
}

function setSeed(seed) {
    randomFromSeed.seed(seed);
    if (previousSeed !== seed) {
        reset();
        previousSeed = seed;
    }
}

function shuffle() {
    if (!alphabet) {
        setCharacters(ORIGINAL);
    }

    var sourceArray = alphabet.split('');
    var targetArray = [];
    var r = randomFromSeed.nextValue();
    var characterIndex;

    while (sourceArray.length > 0) {
        r = randomFromSeed.nextValue();
        characterIndex = Math.floor(r * sourceArray.length);
        targetArray.push(sourceArray.splice(characterIndex, 1)[0]);
    }
    return targetArray.join('');
}

function getShuffled() {
    if (shuffled) {
        return shuffled;
    }
    shuffled = shuffle();
    return shuffled;
}

/**
 * lookup shuffled letter
 * @param index
 * @returns {string}
 */
function lookup(index) {
    var alphabetShuffled = getShuffled();
    return alphabetShuffled[index];
}

module.exports = {
    characters: characters,
    seed: setSeed,
    lookup: lookup,
    shuffled: getShuffled
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Video = exports.Video = function (_React$Component) {
	_inherits(Video, _React$Component);

	function Video() {
		_classCallCheck(this, Video);

		return _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).apply(this, arguments));
	}

	_createClass(Video, [{
		key: 'render',

		// I/P: path, the path to the video
		// O/P: a video player
		// Status: re-written, untested
		value: function render() {
			return React.createElement('video', { src: this.props.path, id: 'video', controls: true });
		}
	}], [{
		key: 'show',
		value: function show() {
			// Resize panels:
			$('#leftPanel').css('width', '40%');
			$('#leftPanel').css('height', 'calc(100% - 48px)');
			$('#centerPanel').css('margin-left', '40%');
			$('#centerPanel').css('height', 'calc(100% - 48px)');
			$("#centerPanel").css("width", "60%");

			// Deactivate audio:
			$('#footer').css('display', 'none');
			$('#audio').removeAttr('ontimeupdate');
			$('#audio').removeAttr('onclick');
			$('#audio').attr('data-live', 'false');

			// Activate video:
			$('#video').css('display', 'inline');
			$('#video').attr('data-live', 'true');
			$('#video').attr('ontimeupdate', 'sync(this.currentTime)');
			$('#video').attr('onclick', 'sync(this.currentTime)');

			// Match times:
			var audio = document.getElementById('audio');
			var video = document.getElementById('video');
			if (!audio.paused) {
				audio.pause();
				video.play();
			}
			video.currentTime = audio.currentTime;
		}
	}, {
		key: 'hide',
		value: function hide() {
			// Resize panels:
			var footheight = ($("#footer").height() + 48).toString() + "px";
			var bodyheight = "calc(100% - " + footheight + ")";

			$("#leftPanel").css("width", "240px");
			$("#leftPanel").css("height", bodyheight);
			$("#centerPanel").css("height", bodyheight);
			$("#centerPanel").css("margin-left", "240px");
			$("#centerPanel").css("width", "calc(100% - 240px)");

			// Deactivate video:
			$("#video").css("display", "none");
			$("#video").removeAttr("onclick");
			$("#video").removeAttr("ontimeupdate");
			$("#video").attr("data-live", "false");

			// Activate audio:
			$("#footer").css("display", "block");
			$("#audio").attr("data-live", "true");
			$("#audio").attr("ontimeupdate", "sync(this.currentTime)");
			$("#audio").attr("onclick", "sync(this.currentTime)");

			// Match times:
			var audio = document.getElementById("audio");
			var video = document.getElementById("video");
			if (!video.paused) {
				video.pause();
				audio.play();
			}
			audio.currentTime = video.currentTime;
		}
	}]);

	return Video;
}(React.Component);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var randomByte = __webpack_require__(13);

function encode(lookup, number) {
    var loopCounter = 0;
    var done;

    var str = '';

    while (!done) {
        str = str + lookup( ( (number >> (4 * loopCounter)) & 0x0f ) | randomByte() );
        done = number < (Math.pow(16, loopCounter + 1 ) );
        loopCounter++;
    }
    return str;
}

module.exports = encode;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Sentence = Sentence;

var _shortid = __webpack_require__(0);

var _shortid2 = _interopRequireDefault(_shortid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Row(_ref) {
	var numSlots = _ref.numSlots,
	    values = _ref.values,
	    tier = _ref.tier;

	// I/P: numSlots, taken from parent sentence
	//      values, list of segments (e.g., morphemes) with start/end times
	//      tier, the tier name
	// O/P: single row of glossed sentence, with colspan spacing
	// Status: tested, working

	// Building a row requires slots to determine the width of certain
	// table elements. Each element will have a start and end slot, and 
	// if there is a gap between an end slot and the following start
	// slot, then a blank table element is input. We use the attribute
	// 'colSpan' to account for elements which require large slots.

	// The currentSlot counter is used to 'fill in' the missing
	// slots when a dependent tier doesn't line up with its corresponding
	// independent tier. For example, if the i-tier goes from 0-12, and
	// the dependent tier goes from 2-5 and 7-12, then the currentSlot
	// counter would be responsible for filling those gaps between 0-2
	// and 5-7.
	var finalSlot = numSlots;
	var currentSlot = 0;
	var output = [];

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var v = _step.value;

			var startSlot = v['start_slot'];
			var endSlot = v['end_slot'];
			var text = v['value'];

			// Add blank space before current value:
			if (startSlot > currentSlot) {
				var _diff = String(startSlot - currentSlot);
				output.push(React.createElement('td', { key: _shortid2.default.generate(), colSpan: _diff }));
			}
			// Create element with correct 'colSpan' width:
			var size = String(endSlot - startSlot);
			output.push(React.createElement(
				'td',
				{ key: _shortid2.default.generate(), colSpan: size },
				text
			));
			currentSlot = endSlot;
		}
		// Fill blank space at end of table row:
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	if (currentSlot < finalSlot) {
		var diff = String(finalSlot - currentSlot);
		output.push(React.createElement('td', { key: _shortid2.default.generate(), colSpan: diff }));
	}
	return React.createElement(
		'tr',
		{ 'data-tier': tier },
		output
	);
}

function Sentence(_ref2) {
	var sentence = _ref2.sentence;

	// I/P: sentence, a sentence
	// O/P: table of glossed Row components
	// Status: tested, working
	var rowList = []; // to be output
	var numSlots = sentence['num_slots'];
	// Add the indepentent tier, i.e., the top row, to the list of rows. Note that
	// 'colSpan={numSlots}' ensures that this row spans the entire table.
	rowList.push(React.createElement(
		'tr',
		{ 'data-tier': sentence['tier'] },
		React.createElement(
			'td',
			{ colSpan: numSlots, className: 'topRow' },
			sentence['text']
		)
	));
	var dependents = sentence['dependents']; // list of dependent tiers, flat structure
	// Add each dependent tier to the row list:
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = dependents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var _step2$value = _step2.value,
			    values = _step2$value.values,
			    tier = _step2$value.tier;

			// Tier attribute will be used for hiding/showing tiers:
			rowList.push(React.createElement(Row, { key: _shortid2.default.generate(), numSlots: numSlots, values: values, tier: tier }));
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	return React.createElement(
		'table',
		{ className: 'gloss' },
		React.createElement(
			'tbody',
			null,
			rowList
		)
	);
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Sidebar = __webpack_require__(6);

var _CenterPanel = __webpack_require__(21);

// Spanish language UI
var speakersUiText = "Hablantes";
var tiersUiText = "Niveles mostradas";
var videoButtonUiText = "Mostrar video";
var storyListUiText = "Lista de cuentos";
/*
// English language UI
var speakersUiText = "Speakers";
var tiersUiText = "Tiers to show";
var videoButtonUiText = "Show video";
var storyListUiText = "List of Stories";
*/

function App(_ref) {
	var data = _ref.data;

	var sentences = data['sentences'];
	var timed = data['metadata']['timed'] == 'true';
	var footer = null;
	if (timed) {
		var audioFile = void 0;
		var media = data['metadata']['media'];
		if ('mp3' in media) {
			audioFile = media['mp3'];
		} else {
			audioFile = media['mp4'];
		}
		footer = React.createElement('audio', { 'data-live': 'true', controls: true, id: 'audio', src: "data/media_files/" + audioFile });
	}
	return React.createElement(
		'div',
		null,
		React.createElement(
			'div',
			{ id: 'middle' },
			React.createElement(_Sidebar.Sidebar, { metadata: data['metadata'] }),
			React.createElement(_CenterPanel.CenterPanel, { timed: timed, sentences: sentences })
		),
		React.createElement(
			'div',
			{ id: 'footer' },
			footer
		)
	);
}

$.getJSON("data/json_files/Intro.json", function (data) {
	ReactDOM.render(React.createElement(App, { data: data }), document.getElementById("main"), function () {
		// If there is a footer, i.e., if audio exists:
		if ($("#footer").length !== 0) {
			$.ajax({
				url: "./js/txt_sync.js",
				dataType: "script"
			});

			// Resize elements based on footer height:
			var footheight = ($("#footer").height() + 48).toString() + "px";
			var bodyheight = "calc(100% - " + footheight + ")";

			$("#leftPanel").css("width", "240px");
			$("#leftPanel").css("height", bodyheight);
			$("#centerPanel").css("height", bodyheight);
		}
	});
});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Sidebar = Sidebar;

var _Title = __webpack_require__(7);

var _Video = __webpack_require__(2);

var _Minibar = __webpack_require__(8);

function Sidebar(_ref) {
	var metadata = _ref.metadata;

	// I/P: metadata, in JSON format
	// O/P: a sidebar complement to the TextDisplay
	// Status: untested
	try {
		var filename = metadata['media']['mp4'];
		var path = 'data/media_files/' + filename;
		return React.createElement(
			'div',
			{ id: 'leftPanel' },
			React.createElement(_Video.Video, { path: path }),
			React.createElement(_Title.Title, { title: metadata['title'] }),
			React.createElement(_Minibar.Minibar, { metadata: metadata, hasVideo: true })
		);
	} catch (err) {
		return React.createElement(
			'div',
			{ id: 'leftPanel' },
			React.createElement(_Title.Title, { title: metadata['title'] }),
			React.createElement(_Minibar.Minibar, { metadata: metadata })
		);
	}
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Title = Title;
function Title(_ref) {
	var title = _ref.title;

	// I/P: title, a string
	// O/P: printed title
	// Status: tested, working
	return React.createElement(
		"h3",
		{ id: "title" },
		title
	);
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Minibar = Minibar;

var _Info = __webpack_require__(9);

var _Search = __webpack_require__(18);

var _Settings = __webpack_require__(19);

function Minibar(_ref) {
	var metadata = _ref.metadata,
	    hasVideo = _ref.hasVideo;

	// I/P: metadata, in JSON format
	//      hasVideo, a boolean
	// O/P: a subsection of the sidebar with hide-able tabs
	// Status: untested, unwritten dependencies

	// Click events for the minibar subsections:
	$(document.body).on('click', '.minibarLink', function (event) {
		event.preventDefault(); // Prevents from following link.
		var activeLink = $('.minibarTabs > li.active > a').attr('href');

		// Find actived navigation and remove 'active' css
		var activeLI = $('.minibarTabs > li.active');
		activeLI.removeClass('active');

		// Add 'active' css into clicked navigation
		$(this).parents('li').addClass('active');

		// Hide displaying tab content
		$(activeLink).removeClass('active');
		$(activeLink).addClass('hide');

		// Show target tab content
		var newLink = $(this).attr('href');
		$(newLink).removeClass('hide');
		$(newLink).addClass('active');
	});

	return React.createElement(
		'div',
		{ id: 'minibar' },
		React.createElement(
			'ul',
			{ className: 'minibarTabs' },
			React.createElement(
				'li',
				{ className: 'active' },
				React.createElement(
					'a',
					{ className: 'minibarLink', href: '#info' },
					React.createElement('img', { src: 'images/info.svg' })
				)
			),
			React.createElement(
				'li',
				null,
				React.createElement(
					'a',
					{ className: 'minibarLink', href: '#search' },
					React.createElement('img', { src: 'images/search.svg' })
				)
			),
			React.createElement(
				'li',
				null,
				React.createElement(
					'a',
					{ className: 'minibarLink', href: '#settings' },
					React.createElement('img', { src: 'images/settings.svg' })
				)
			)
		),
		React.createElement(
			'div',
			{ id: 'miniPage' },
			React.createElement(_Info.Info, { metadata: metadata }),
			React.createElement(_Search.Search, null),
			React.createElement(_Settings.Settings, { tiers: metadata['tier IDs'], hasVideo: hasVideo })
		)
	);
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Info = Info;

var _SpeakerInfo = __webpack_require__(10);

function Info(_ref) {
	var metadata = _ref.metadata;

	// I/P: metadata, in JSON format
	// O/P: a nice display of speaker names + other metadata
	// Status: unfinished
	return React.createElement(
		"div",
		{ id: "info", className: "miniPage active" },
		React.createElement(_SpeakerInfo.SpeakerInfo, { speakers: metadata['speaker IDs'] })
	);
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SpeakerInfo = SpeakerInfo;

var _shortid = __webpack_require__(0);

var _shortid2 = _interopRequireDefault(_shortid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SpeakerInfo(_ref) {
	var speakers = _ref.speakers;

	// I/P: speakers, a map from speaker IDs to objects containing speaker names, languages, etc.
	// O/P: some nicely formatted info about these speakers
	// Status: tested, not working
	var speaker_list = [];
	if (speakers != null) {
		// Form a list of speakers:
		for (var speaker_id in speakers) {
			if (speakers.hasOwnProperty(speaker_id)) {
				var speaker_name = speakers[speaker_id]['name'];
				var speaker_display = speaker_id + ': ' + speaker_name;
				speaker_list.push(React.createElement(
					'li',
					{ key: _shortid2.default.generate() },
					speaker_display
				));
			}
		}
		return React.createElement(
			'div',
			{ id: 'speakerList' },
			'Speakers: ',
			React.createElement(
				'ul',
				null,
				speaker_list
			)
		);
	} else {
		return null;
	}
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var alphabet = __webpack_require__(1);
var encode = __webpack_require__(3);
var decode = __webpack_require__(14);
var build = __webpack_require__(15);
var isValid = __webpack_require__(16);

// if you are using cluster or multiple servers use this to make each instance
// has a unique value for worker
// Note: I don't know if this is automatically set when using third
// party cluster solutions such as pm2.
var clusterWorkerId = __webpack_require__(17) || 0;

/**
 * Set the seed.
 * Highly recommended if you don't want people to try to figure out your id schema.
 * exposed as shortid.seed(int)
 * @param seed Integer value to seed the random alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
 */
function seed(seedValue) {
    alphabet.seed(seedValue);
    return module.exports;
}

/**
 * Set the cluster worker or machine id
 * exposed as shortid.worker(int)
 * @param workerId worker must be positive integer.  Number less than 16 is recommended.
 * returns shortid module so it can be chained.
 */
function worker(workerId) {
    clusterWorkerId = workerId;
    return module.exports;
}

/**
 *
 * sets new characters to use in the alphabet
 * returns the shuffled alphabet
 */
function characters(newCharacters) {
    if (newCharacters !== undefined) {
        alphabet.characters(newCharacters);
    }

    return alphabet.shuffled();
}

/**
 * Generate unique id
 * Returns string id
 */
function generate() {
  return build(clusterWorkerId);
}

// Export all other functions as properties of the generate function
module.exports = generate;
module.exports.generate = generate;
module.exports.seed = seed;
module.exports.worker = worker;
module.exports.characters = characters;
module.exports.decode = decode;
module.exports.isValid = isValid;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Found this seed-based random generator somewhere
// Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)

var seed = 1;

/**
 * return a random number based on a seed
 * @param seed
 * @returns {number}
 */
function getNextValue() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed/(233280.0);
}

function setSeed(_seed_) {
    seed = _seed_;
}

module.exports = {
    nextValue: getNextValue,
    seed: setSeed
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var crypto = typeof window === 'object' && (window.crypto || window.msCrypto); // IE 11 uses window.msCrypto

function randomByte() {
    if (!crypto || !crypto.getRandomValues) {
        return Math.floor(Math.random() * 256) & 0x30;
    }
    var dest = new Uint8Array(1);
    crypto.getRandomValues(dest);
    return dest[0] & 0x30;
}

module.exports = randomByte;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var alphabet = __webpack_require__(1);

/**
 * Decode the id to get the version and worker
 * Mainly for debugging and testing.
 * @param id - the shortid-generated id.
 */
function decode(id) {
    var characters = alphabet.shuffled();
    return {
        version: characters.indexOf(id.substr(0, 1)) & 0x0f,
        worker: characters.indexOf(id.substr(1, 1)) & 0x0f
    };
}

module.exports = decode;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var encode = __webpack_require__(3);
var alphabet = __webpack_require__(1);

// Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
// This number should be updated every year or so to keep the generated id short.
// To regenerate `new Date() - 0` and bump the version. Always bump the version!
var REDUCE_TIME = 1459707606518;

// don't change unless we change the algos or REDUCE_TIME
// must be an integer and less than 16
var version = 6;

// Counter is used when shortid is called multiple times in one second.
var counter;

// Remember the last time shortid was called in case counter is needed.
var previousSeconds;

/**
 * Generate unique id
 * Returns string id
 */
function build(clusterWorkerId) {

    var str = '';

    var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);

    if (seconds === previousSeconds) {
        counter++;
    } else {
        counter = 0;
        previousSeconds = seconds;
    }

    str = str + encode(alphabet.lookup, version);
    str = str + encode(alphabet.lookup, clusterWorkerId);
    if (counter > 0) {
        str = str + encode(alphabet.lookup, counter);
    }
    str = str + encode(alphabet.lookup, seconds);

    return str;
}

module.exports = build;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var alphabet = __webpack_require__(1);

function isShortId(id) {
    if (!id || typeof id !== 'string' || id.length < 6 ) {
        return false;
    }

    var characters = alphabet.characters();
    var len = id.length;
    for(var i = 0; i < len;i++) {
        if (characters.indexOf(id[i]) === -1) {
            return false;
        }
    }
    return true;
}

module.exports = isShortId;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = 0;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Search = Search;
function Search() {
	// I/P: ---
	// O/P: a search bar with concordance functionality
	// Status: unfinished
	return React.createElement(
		"h4",
		{ id: "search", className: "miniPage hide" },
		"Not yet implemented."
	);
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.Settings = Settings;

var _TierCheckboxList = __webpack_require__(20);

var _Video = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VideoButton = function (_React$Component) {
  _inherits(VideoButton, _React$Component);

  // I/P: --
  // O/P: a button that can show/hide video, reset "player" ID, etc.
  // Status: unfinished
  function VideoButton(props) {
    _classCallCheck(this, VideoButton);

    var _this = _possibleConstructorReturn(this, (VideoButton.__proto__ || Object.getPrototypeOf(VideoButton)).call(this, props));

    _this.state = {
      checkboxState: false
    };
    _this.toggle = _this.toggle.bind(_this);
    return _this;
  }

  _createClass(VideoButton, [{
    key: 'toggle',
    value: function toggle(event) {
      this.setState({ checkboxState: !this.state.checkboxState });

      if (!this.state.checkboxState) {
        _Video.Video.show();
      } else {
        _Video.Video.hide();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { id: 'videoButton' },
        React.createElement('input', { type: 'checkbox', onClick: this.toggle }),
        React.createElement(
          'label',
          null,
          'Show video'
        )
      );
    }
  }]);

  return VideoButton;
}(React.Component);

function Settings(_ref) {
  var tiers = _ref.tiers,
      hasVideo = _ref.hasVideo;

  // I/P: tiers, a hashmap from Tier IDs to their names
  //      hasVideo, a boolean
  // O/P: a search bar with concordance functionality
  // Status: unfinished
  return React.createElement(
    'div',
    { id: 'settings', className: 'miniPage hide' },
    React.createElement(_TierCheckboxList.TierCheckboxList, { tiers: tiers }),
    React.createElement(VideoButton, null)
  );
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
   value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.TierCheckboxList = TierCheckboxList;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TierCheckbox = function (_React$Component) {
   _inherits(TierCheckbox, _React$Component);

   // I/P: tier_id, a string like "T1" or "T15"
   //    tier_name, a string like "English Morphemes"
   // O/P: a checkbox with the ability to hide/show elements with tier-data={tier_id}
   // Status: tested, working
   function TierCheckbox(props) {
      _classCallCheck(this, TierCheckbox);

      var _this = _possibleConstructorReturn(this, (TierCheckbox.__proto__ || Object.getPrototypeOf(TierCheckbox)).call(this, props));

      _this.state = {
         checkboxState: true
      };
      _this.toggle = _this.toggle.bind(_this);
      return _this;
   }

   _createClass(TierCheckbox, [{
      key: "toggle",
      value: function toggle(event) {
         this.setState({ checkboxState: !this.state.checkboxState });

         if (this.state.checkboxState) {
            $("tr[data-tier='" + this.props.tier_id + "']").css('display', 'none');
         } else {
            $("tr[data-tier='" + this.props.tier_id + "']").css('display', 'table-row');
         }
      }
   }, {
      key: "render",
      value: function render() {
         var tier_id = this.props.tier_id;
         var tier_name = this.props.tier_name;
         return React.createElement(
            "li",
            null,
            React.createElement("input", { type: "checkbox", onClick: this.toggle, defaultChecked: true }),
            React.createElement(
               "label",
               null,
               tier_name
            )
         );
      }
   }]);

   return TierCheckbox;
}(React.Component);

function TierCheckboxList(_ref) {
   var tiers = _ref.tiers;

   // I/P: tiers, a hashmap from Tier IDs to their names
   // O/P: an unordered list of TierCheckboxes
   // Status: tested, working
   var output = [];
   for (var tier_id in tiers) {
      if (tiers.hasOwnProperty(tier_id)) {
         output.push(React.createElement(TierCheckbox, { key: tier_id, tier_id: tier_id, tier_name: tiers[tier_id] }));
      }
   }
   return React.createElement(
      "div",
      { id: "tierList" },
      "Show/hide tiers: ",
      React.createElement(
         "ul",
         null,
         output
      )
   );
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CenterPanel = CenterPanel;

var _Untimed = __webpack_require__(22);

var _Timed = __webpack_require__(23);

function CenterPanel(_ref) {
	var timed = _ref.timed,
	    sentences = _ref.sentences;

	// I/P: timed, a boolean value
	//      sentences, a list of sentences
	// O/P: the main panel showing glossing, timestamps, etc.
	// Status: tested, working

	if (timed) {
		return React.createElement(
			'div',
			{ id: 'centerPanel' },
			React.createElement(_Timed.TimedTextDisplay, { sentences: sentences })
		);
	} else {
		return React.createElement(
			'div',
			{ id: 'centerPanel' },
			React.createElement(_Untimed.UntimedTextDisplay, { sentences: sentences })
		);
	}
}

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.UntimedTextDisplay = UntimedTextDisplay;

var _shortid = __webpack_require__(0);

var _shortid2 = _interopRequireDefault(_shortid);

var _Sentence = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function UntimedTextDisplay(_ref) {
	var sentences = _ref.sentences;

	// I/P: sentences, a list of sentences
	// O/P: the main gloss view, with several Sentences arranged vertically, each wrapped in an UntimedBlock
	// Status: tested, working
	var output = [];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = sentences[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var sentence = _step.value;

			output.push(React.createElement(
				"div",
				{ key: _shortid2.default.generate(), className: "untimedBlock" },
				React.createElement(_Sentence.Sentence, { key: _shortid2.default.generate(), sentence: sentence })
			));
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return React.createElement(
		"div",
		{ id: "untimedTextDisplay" },
		output
	);
}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TimedTextDisplay = TimedTextDisplay;

var _shortid = __webpack_require__(0);

var _shortid2 = _interopRequireDefault(_shortid);

var _Sentence = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function LabeledSentence(_ref) {
	var sentence = _ref.sentence;

	// I/P: sentence, a sentence
	// O/P: glossed sentence with speaker label
	// Status: tested, working
	var label = sentence['speaker'];
	return React.createElement(
		'div',
		{ className: 'labeledSentence' },
		React.createElement(
			'span',
			{ className: 'speakerLabel' },
			label,
			': '
		),
		React.createElement(_Sentence.Sentence, { sentence: sentence, isTimeAligned: true })
	);
}

function TimeBlock(_ref2) {
	var sentences = _ref2.sentences;

	// I/P: sentences, a list of sentences with the same start time
	// O/P: div containing multiple LabeledSentences
	// Status: tested, working
	var output = [];
	// A timeblock may contain multiple sentences with the same start time.
	// Iterate through the list of these sentences.
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = sentences[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var sentence = _step.value;

			output.push(React.createElement(LabeledSentence, { key: _shortid2.default.generate(), sentence: sentence }));
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return React.createElement(
		'div',
		{ className: 'timeBlock' },
		output
	);
}

function printSeconds(r) {
	// I/P: an integer number of seconds
	// O/P: time interval in h:mm:s or m:ss format (a string)
	// Status: tested, working
	r = Number(r);var t = Math.floor(r / 3600),
	    i = Math.floor(r % 3600 / 60),
	    n = Math.floor(r % 3600 % 60);if (n >= 10) e = String(n);else var e = "0" + String(n);var o = String(i) + ":";if (0 == t) a = "";else if (i >= 10) a = String(t) + ":";else var a = String(t) + ":0";return a + o + e;
}

function LabeledTimeBlock(_ref3) {
	var sentences = _ref3.sentences,
	    timestamp = _ref3.timestamp;

	// I/P: sentences, a list of sentences with the same start time
	//      timestamp, an integer number of seconds
	// O/P: a TimeBlock with a left-floating timestamp
	// Status: tested, working
	timestamp = printSeconds(timestamp);
	// Return the actual start and end time of this block in ms. Note that end times may differ,
	// so take the latest endtime of any sentence in this timeblock. These will be used in attributes
	// to render the current block in time with audio/video.
	var minStart = Number.POSITIVE_INFINITY;
	var maxEnd = Number.NEGATIVE_INFINITY;
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = sentences[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var sentence = _step2.value;

			var startTime = sentence["start_time_ms"];
			var endTime = sentence["end_time_ms"];
			if (startTime < minStart) {
				minStart = startTime;
			}
			if (endTime > maxEnd) {
				maxEnd = endTime;
			}
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	return React.createElement(
		'div',
		{ className: 'labeledTimeBlock', 'data-start_time': minStart, 'data-end_time': maxEnd },
		React.createElement(
			'span',
			{ className: 'timeStampContainer' },
			React.createElement(
				'a',
				{ href: 'javascript:void(0)', 'data-start_time': minStart, className: 'timeStamp' },
				timestamp
			)
		),
		React.createElement(TimeBlock, { sentences: sentences })
	);
}

function TimedTextDisplay(_ref4) {
	var sentences = _ref4.sentences;

	// I/P: sentences, stored in JSON format, as in test_data.json
	// O/P: the main gloss view, with several LabeledTimeBlocks arranged vertically
	// Status: tested, working
	// Note: very dependent on correct formatting of data
	var output = [];

	// Steps to create ordered, unique TimeBlocks:
	//  1) Create a hashmap from start_times (in sec) to lists of sentences
	//  2) Sort the keys of this hashmap (stored in uniqueTimestamps)
	//  3) Each key-value pair corresponds to a unique TimeBlock

	var timesToSentences = {}; // hashmap from timestamps (in sec) to lists of sentences
	var uniqueTimestamps = []; // for sorting keys
	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = sentences[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var sentence = _step3.value;

			var timestampMs = sentence['start_time_ms'];
			var timestampSec = Math.floor(timestampMs / 1000); // msec -> sec
			if (timestampSec in timesToSentences) {
				timesToSentences[timestampSec].push(sentence);
			} else {
				uniqueTimestamps.push(timestampSec);
				timesToSentences[timestampSec] = [sentence];
			}
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	uniqueTimestamps.sort(function (a, b) {
		return a - b;
	}); // to avoid alphanumeric sorting
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = uniqueTimestamps[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var timestamp = _step4.value;

			var correspondingSentences = timesToSentences[timestamp];
			output.push(React.createElement(LabeledTimeBlock, {
				key: _shortid2.default.generate(),
				sentences: correspondingSentences,
				timestamp: timestamp
			}));
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4.return) {
				_iterator4.return();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	return React.createElement(
		'div',
		{ id: 'timedTextDisplay' },
		output
	);
}

/***/ })
/******/ ]);