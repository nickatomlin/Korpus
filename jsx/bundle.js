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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var randomFromSeed = __webpack_require__(7);

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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var id = __webpack_require__(5);

function Row(_ref) {
	var num_slots = _ref.num_slots,
	    values = _ref.values,
	    tier = _ref.tier;

	// I/P: num_slots, taken from parent sentence
	//      values, list of segments (e.g., morphemes) with start/end times
	//      tier, the tier name
	// O/P: single row of glossed sentence, with colspan spacing
	// Status: tested, working

	// Building a row requires slots to determine the width of certain
	// table elements. Each element will have a start and end slot, and 
	// if there is a gap between an end slot and the following start
	// slot, then a blank table element is input. We use the attribute
	// 'colSpan' to account for elements which require large slots.

	// The current_slot counter is used to 'fill in' the missing
	// slots when a dependent tier doesn't line up with its corresponding
	// independent tier. For example, if the i-tier goes from 0-12, and
	// the dependent tier goes from 2-5 and 7-12, then the current_slot
	// counter would be responsible for filling those gaps between 0-2
	// and 5-7.
	var final_slot = num_slots;
	var current_slot = 0;
	var output = [];

	for (var i = 0; i < values.length; i++) {
		var v = values[i];
		var start_slot = v['start_slot'];
		var end_slot = v['end_slot'];
		var text = v['value'];

		// Add blank space before current value:
		if (start_slot > current_slot) {
			var diff = String(start_slot - current_slot);
			output.push(React.createElement('td', { key: id.generate(), colSpan: diff }));
		}
		// Create element with correct 'colSpan' width:
		var size = String(end_slot - start_slot);
		output.push(React.createElement(
			'td',
			{ key: id.generate(), colSpan: size },
			text
		));
		current_slot = end_slot;
	}
	// Fill blank space at end of table row:
	if (current_slot < final_slot) {
		var _diff = String(final_slot - current_slot);
		output.push(React.createElement('td', { key: id.generate(), colSpan: _diff }));
	}
	return React.createElement(
		'tr',
		{ 'data-tier': tier },
		output
	);
}

var Sentence = exports.Sentence = function (_React$Component) {
	_inherits(Sentence, _React$Component);

	function Sentence() {
		_classCallCheck(this, Sentence);

		return _possibleConstructorReturn(this, (Sentence.__proto__ || Object.getPrototypeOf(Sentence)).apply(this, arguments));
	}

	_createClass(Sentence, [{
		key: 'render',

		// I/P: value, a sentence
		// O/P: table of glossed Row components
		// Status: tested, working
		value: function render() {
			var row_list = []; // to be output
			var sentence = this.props.value;
			var num_slots = sentence['num_slots'];
			// Add the indepentent tier, i.e., the top row, to the list of rows. Note that
			// 'colSpan={num_slots}' ensures that this row spans the entire table.
			row_list.push(React.createElement(
				'tr',
				{ key: id.generate(), 'data-tier': sentence['tier'] },
				React.createElement(
					'td',
					{ colSpan: num_slots, className: 'topRow' },
					sentence['text']
				)
			));
			var dependents = sentence['dependents']; // list of dependent tiers, flat structure
			// Add each dependent tier to the row list:
			for (var i = 0; i < dependents.length; i++) {
				var dependent = dependents[i];
				// Tier attribute will be used for hiding/showing tiers:
				var tier = dependent['tier'];
				row_list.push(React.createElement(Row, { key: id.generate(), num_slots: num_slots, values: dependent['values'], tier: tier }));
			}
			return React.createElement(
				'table',
				{ className: 'gloss' },
				React.createElement(
					'tbody',
					null,
					row_list
				)
			);
		}
	}]);

	return Sentence;
}(React.Component);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var randomByte = __webpack_require__(8);

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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _untimed = __webpack_require__(4);

var _timed = __webpack_require__(13);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var CenterPanel = function (_React$Component) {
  _inherits(CenterPanel, _React$Component);

  function CenterPanel() {
    _classCallCheck(this, CenterPanel);

    return _possibleConstructorReturn(this, (CenterPanel.__proto__ || Object.getPrototypeOf(CenterPanel)).apply(this, arguments));
  }

  _createClass(CenterPanel, [{
    key: 'render',

    // I/P: timed, a boolean value
    //      sentences, a list of sentences
    // O/P: untested
    value: function render() {
      if (this.props.timed) {
        return React.createElement(
          'div',
          { id: 'centerPanel' },
          React.createElement(_timed.TimedTextDisplay, { sentences: this.props.sentences })
        );
      } else {
        return React.createElement(
          'div',
          { id: 'centerPanel' },
          React.createElement(_untimed.UntimedTextDisplay, { sentences: this.props.sentences })
        );
      }
    }
  }]);

  return CenterPanel;
}(React.Component);

var TierCheckbox = function (_React$Component2) {
  _inherits(TierCheckbox, _React$Component2);

  // I/P: tier_id, a string like "T1" or "T15"
  //    tier_name, a string like "English Morphemes"
  // O/P: a checkbox with the ability to hide/show elements with tier-data={tier_id}
  // Status: tested, working
  function TierCheckbox(props) {
    _classCallCheck(this, TierCheckbox);

    var _this2 = _possibleConstructorReturn(this, (TierCheckbox.__proto__ || Object.getPrototypeOf(TierCheckbox)).call(this, props));

    _this2.state = {
      checkboxState: true
    };
    _this2.toggle = _this2.toggle.bind(_this2);
    return _this2;
  }

  _createClass(TierCheckbox, [{
    key: 'toggle',
    value: function toggle(event) {
      this.setState({ checkboxState: !this.state.checkboxState });
      if (this.state.checkboxState) {
        $("tr[data-tier='" + this.props.tier_id + "']").css("display", "none");
      } else {
        $("tr[data-tier='" + this.props.tier_id + "']").css("display", "table-row");
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var tier_id = this.props.tier_id;
      var tier_name = this.props.tier_name;
      return React.createElement(
        'li',
        null,
        React.createElement('input', { type: 'checkbox', onClick: this.toggle, defaultChecked: true }),
        React.createElement(
          'label',
          null,
          tier_name
        )
      );
    }
  }]);

  return TierCheckbox;
}(React.Component);

var TierCheckboxList = function (_React$Component3) {
  _inherits(TierCheckboxList, _React$Component3);

  function TierCheckboxList() {
    _classCallCheck(this, TierCheckboxList);

    return _possibleConstructorReturn(this, (TierCheckboxList.__proto__ || Object.getPrototypeOf(TierCheckboxList)).apply(this, arguments));
  }

  _createClass(TierCheckboxList, [{
    key: 'render',

    // I/P: tiers, a hashmap from Tier IDs to their names
    // O/P: an unordered list of TierCheckboxes
    // Status: tested, working
    value: function render() {
      var output = [];
      var tiers = this.props.tiers;
      for (var tier_id in tiers) {
        if (tiers.hasOwnProperty(tier_id)) {
          output.push(React.createElement(TierCheckbox, { key: tier_id, tier_id: tier_id, tier_name: tiers[tier_id] }));
        }
      }
      return React.createElement(
        'div',
        { id: 'tierList' },
        tiersUiText,
        ': ',
        React.createElement(
          'ul',
          null,
          output
        )
      );
    }
  }]);

  return TierCheckboxList;
}(React.Component);

var SpeakerInfo = function (_React$Component4) {
  _inherits(SpeakerInfo, _React$Component4);

  function SpeakerInfo() {
    _classCallCheck(this, SpeakerInfo);

    return _possibleConstructorReturn(this, (SpeakerInfo.__proto__ || Object.getPrototypeOf(SpeakerInfo)).apply(this, arguments));
  }

  _createClass(SpeakerInfo, [{
    key: 'render',

    // I/P: speakers, a map from speaker IDs to objects containing speaker names, languages, etc.
    // O/P: some nicely formatted info about these speakers
    // Status: tested, working
    value: function render() {
      var speaker_list = [];
      var speakers = this.props.speakers;
      if (speakers != null) {
        for (var speaker_id in speakers) {
          if (speakers.hasOwnProperty(speaker_id)) {
            var speaker_name = speakers[speaker_id]["name"];
            var speaker_display = speaker_id + ": " + speaker_name;
            speaker_list.push(React.createElement(
              'li',
              { key: speaker_id },
              speaker_display
            ));
          }
        }
        return React.createElement(
          'div',
          { id: 'speakerList' },
          speakersUiText,
          ': ',
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
  }]);

  return SpeakerInfo;
}(React.Component);

function showVideo() {
  // do stuff
}

$.getJSON("data/aldar/5459352f3b9eb1d2b71071a7f40008ef", function (data) {
  ReactDOM.render(React.createElement(CenterPanel, { className: 'centerPanel', timed: true, sentences: data["sentences"] }), document.getElementById("main"));
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.UntimedTextDisplay = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sentence = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UntimedTextDisplay = exports.UntimedTextDisplay = function (_React$Component) {
	_inherits(UntimedTextDisplay, _React$Component);

	function UntimedTextDisplay() {
		_classCallCheck(this, UntimedTextDisplay);

		return _possibleConstructorReturn(this, (UntimedTextDisplay.__proto__ || Object.getPrototypeOf(UntimedTextDisplay)).apply(this, arguments));
	}

	_createClass(UntimedTextDisplay, [{
		key: "render",

		// I/P: sentences, a list of sentences
		// O/P: the main gloss view, with several Sentences arranged vertically, each wrapped in an UntimedBlock
		// Status: tested, working
		value: function render() {
			var sentences = this.props.sentences;
			var output = [];
			for (var i = 0; i < sentences.length; i++) {
				var sentence = sentences[i];
				output.push(React.createElement(
					"div",
					{ key: i, className: "untimedBlock" },
					React.createElement(_sentence.Sentence, { key: i, value: sentence })
				));
			}
			return React.createElement(
				"div",
				{ className: "untimedTextDisplay", id: "td" },
				output
			);
		}
	}]);

	return UntimedTextDisplay;
}(React.Component);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = __webpack_require__(6);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var alphabet = __webpack_require__(0);
var encode = __webpack_require__(2);
var decode = __webpack_require__(9);
var build = __webpack_require__(10);
var isValid = __webpack_require__(11);

// if you are using cluster or multiple servers use this to make each instance
// has a unique value for worker
// Note: I don't know if this is automatically set when using third
// party cluster solutions such as pm2.
var clusterWorkerId = __webpack_require__(12) || 0;

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
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var alphabet = __webpack_require__(0);

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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var encode = __webpack_require__(2);
var alphabet = __webpack_require__(0);

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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var alphabet = __webpack_require__(0);

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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = 0;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TimedTextDisplay = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sentence = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LabeledSentence = function (_React$Component) {
	_inherits(LabeledSentence, _React$Component);

	function LabeledSentence() {
		_classCallCheck(this, LabeledSentence);

		return _possibleConstructorReturn(this, (LabeledSentence.__proto__ || Object.getPrototypeOf(LabeledSentence)).apply(this, arguments));
	}

	_createClass(LabeledSentence, [{
		key: "render",

		// I/P: value, a sentence
		// O/P: glossed sentence with speaker label
		// Status: tested, working
		value: function render() {
			var sentence = this.props.value;
			var label = sentence["speaker"];
			return React.createElement(
				"div",
				{ className: "labeledSentence" },
				React.createElement(
					"span",
					{ className: "speakerLabel" },
					label,
					": "
				),
				React.createElement(_sentence.Sentence, { value: sentence, isTimeAligned: true })
			);
		}
	}]);

	return LabeledSentence;
}(React.Component);

var TimeBlock = function (_React$Component2) {
	_inherits(TimeBlock, _React$Component2);

	function TimeBlock() {
		_classCallCheck(this, TimeBlock);

		return _possibleConstructorReturn(this, (TimeBlock.__proto__ || Object.getPrototypeOf(TimeBlock)).apply(this, arguments));
	}

	_createClass(TimeBlock, [{
		key: "render",

		// I/P: sentences, a list of sentences with the same start time
		// O/P: div containing multiple LabeledSentences
		// Status: tested, working
		value: function render() {
			var sentences = this.props.sentences;
			var output = [];
			// A timeblock may contain multiple sentences with the same start time.
			// Iterate through the list of these sentences.
			for (var i = 0; i < sentences.length; i++) {
				var sentence = sentences[i];
				output.push(React.createElement(LabeledSentence, { key: i, value: sentence }));
			}
			return React.createElement(
				"div",
				{ className: "timeBlock" },
				output
			);
		}
	}]);

	return TimeBlock;
}(React.Component);

// I/P: an integer number of seconds
// O/P: time interval in h:mm:s or m:ss format
// Status: tested, working


function printSeconds(r) {
	r = Number(r);var t = Math.floor(r / 3600),
	    i = Math.floor(r % 3600 / 60),
	    n = Math.floor(r % 3600 % 60);if (n >= 10) e = String(n);else var e = "0" + String(n);var o = String(i) + ":";if (0 == t) a = "";else if (i >= 10) a = String(t) + ":";else var a = String(t) + ":0";return a + o + e;
}

var LabeledTimeBlock = function (_React$Component3) {
	_inherits(LabeledTimeBlock, _React$Component3);

	function LabeledTimeBlock() {
		_classCallCheck(this, LabeledTimeBlock);

		return _possibleConstructorReturn(this, (LabeledTimeBlock.__proto__ || Object.getPrototypeOf(LabeledTimeBlock)).apply(this, arguments));
	}

	_createClass(LabeledTimeBlock, [{
		key: "render",

		// I/P: sentences, a list of sentences with the same start time
		//      timestamp, an integer number of seconds
		//      isFinalBlock, a boolean value
		// O/P: a TimeBlock with a left-floating timestamp
		// Status: tested, working
		value: function render() {
			var sentences = this.props.sentences;
			var timestamp = printSeconds(this.props.timestamp);
			var isFinalBlock = this.props.isFinalBlock;
			// Return the actual start and end time of this block in ms. Note that end times may differ,
			// so take the latest endtime of any sentence in this timeblock. These will be used in attributes
			// to render the current block in time with audio/video.
			var min_start = Number.POSITIVE_INFINITY;
			var max_end = Number.NEGATIVE_INFINITY;
			for (var i = 0; i < sentences.length; i++) {
				var sentence = sentences[i];
				var start_time = sentence["start_time_ms"];
				var end_time = sentence["end_time_ms"];
				if (start_time < min_start) {
					min_start = start_time;
				}
				if (end_time > max_end) {
					max_end = end_time;
				}
			}
			return React.createElement(
				"div",
				{ className: "labeledTimeBlock", "data-start_time": min_start, "data-end_time": max_end },
				React.createElement(
					"span",
					{ className: "timeStampContainer" },
					React.createElement(
						"a",
						{ href: "javascript:void(0)", "data-start_time": min_start, className: "timeStamp" },
						timestamp
					)
				),
				React.createElement(TimeBlock, { sentences: sentences })
			);
		}
	}]);

	return LabeledTimeBlock;
}(React.Component);

var TimedTextDisplay = exports.TimedTextDisplay = function (_React$Component4) {
	_inherits(TimedTextDisplay, _React$Component4);

	function TimedTextDisplay() {
		_classCallCheck(this, TimedTextDisplay);

		return _possibleConstructorReturn(this, (TimedTextDisplay.__proto__ || Object.getPrototypeOf(TimedTextDisplay)).apply(this, arguments));
	}

	_createClass(TimedTextDisplay, [{
		key: "render",

		// I/P: sentences, stored in JSON format, as in test_data.json
		// O/P: the main gloss view, with several LabeledTimeBlocks arranged vertically
		// Status: tested, working
		// Note: very dependent on correct formatting of data
		value: function render() {
			var output = [];
			var sentences = this.props.sentences;

			// Steps to create ordered, unique TimeBlocks:
			//  1) Create a hashmap from start_times (in sec) to lists of sentences
			//  2) Sort the keys of this hashmap (stored in unique_timestamps)
			//  3) Each key-value pair corresponds to a unique TimeBlock

			var times_to_sentences = {}; // hashmap from timestamps (in sec) to lists of sentences
			var unique_timestamps = []; // for sorting keys
			for (var i = 0; i < sentences.length; i++) {
				var sentence = sentences[i];
				var timestamp_ms = sentence["start_time_ms"];
				var timestamp_sec = Math.floor(timestamp_ms / 1000); // msec -> sec
				if (timestamp_sec in times_to_sentences) {
					times_to_sentences[timestamp_sec].push(sentence);
				} else {
					unique_timestamps.push(timestamp_sec);
					times_to_sentences[timestamp_sec] = [sentence];
				}
			}
			unique_timestamps.sort(function (a, b) {
				return a - b;
			}); // to avoid alphanumeric sorting
			for (var i = 0; i < unique_timestamps.length; i++) {
				var timestamp = unique_timestamps[i];
				var corresponding_sentences = times_to_sentences[timestamp];
				output.push(React.createElement(LabeledTimeBlock, { key: i, sentences: corresponding_sentences, timestamp: timestamp }));
			}
			return React.createElement(
				"div",
				{ id: "timedTextDisplay" },
				output
			);
		}
	}]);

	return TimedTextDisplay;
}(React.Component);

/***/ })
/******/ ]);