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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _row = __webpack_require__(1);

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

var Sentence = function (_React$Component) {
	_inherits(Sentence, _React$Component);

	function Sentence() {
		_classCallCheck(this, Sentence);

		return _possibleConstructorReturn(this, (Sentence.__proto__ || Object.getPrototypeOf(Sentence)).apply(this, arguments));
	}

	_createClass(Sentence, [{
		key: "render",

		// I/P: value, a sentence
		// O/P: table of glossed Row components
		// Status: tested, working
		value: function render() {
			var row_list = []; // to be output
			var sentence = this.props.value;
			var num_slots = sentence["num_slots"];
			// Add the indepentent tier, i.e., the top row, to the list of rows. Note that
			// "colSpan={num_slots}" ensures that this row spans the entire table.
			row_list.push(React.createElement(
				"tr",
				{ key: 0, "data-tier": sentence["tier"] },
				React.createElement(
					"td",
					{ colSpan: num_slots, className: "topRow" },
					sentence["text"]
				)
			));
			var dependents = sentence["dependents"]; // list of dependent tiers, flat structure
			// Add each dependent tier to the row list:
			for (var i = 0; i < dependents.length; i++) {
				var dependent = dependents[i];
				// Tier attribute will be used for hiding/showing tiers:
				var tier = dependent["tier"];
				row_list.push(React.createElement(_row.Row, { key: i + 1, num_slots: num_slots, values: dependent["values"], tier: tier }));
			}
			return React.createElement(
				"table",
				{ className: "gloss" },
				React.createElement(
					"tbody",
					null,
					row_list
				)
			);
		}
	}]);

	return Sentence;
}(React.Component);

var LabeledSentence = function (_React$Component2) {
	_inherits(LabeledSentence, _React$Component2);

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
				React.createElement(Sentence, { value: sentence, isTimeAligned: true })
			);
		}
	}]);

	return LabeledSentence;
}(React.Component);

var TimeBlock = function (_React$Component3) {
	_inherits(TimeBlock, _React$Component3);

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

var LabeledTimeBlock = function (_React$Component4) {
	_inherits(LabeledTimeBlock, _React$Component4);

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

var TimedTextDisplay = function (_React$Component5) {
	_inherits(TimedTextDisplay, _React$Component5);

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

var UntimedTextDisplay = function (_React$Component6) {
	_inherits(UntimedTextDisplay, _React$Component6);

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
					React.createElement(Sentence, { key: i, value: sentence })
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

var CenterPanel = function (_React$Component7) {
	_inherits(CenterPanel, _React$Component7);

	function CenterPanel() {
		_classCallCheck(this, CenterPanel);

		return _possibleConstructorReturn(this, (CenterPanel.__proto__ || Object.getPrototypeOf(CenterPanel)).apply(this, arguments));
	}

	_createClass(CenterPanel, [{
		key: "render",

		// I/P: timed, a boolean value
		//      sentences, a list of sentences
		// O/P: untested
		value: function render() {
			if (this.props.timed) {
				return React.createElement(
					"div",
					{ id: "centerPanel" },
					React.createElement(TimedTextDisplay, { sentences: this.props.sentences })
				);
			} else {
				return React.createElement(
					"div",
					{ id: "centerPanel" },
					React.createElement(UntimedTextDisplay, { sentences: this.props.sentences })
				);
			}
		}
	}]);

	return CenterPanel;
}(React.Component);

// SETTINGS + VIDEO PANEL

var Video = function (_React$Component8) {
	_inherits(Video, _React$Component8);

	function Video() {
		_classCallCheck(this, Video);

		return _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).apply(this, arguments));
	}

	_createClass(Video, [{
		key: "render",

		// I/P: path, the path to the video
		//		  default, a boolean value (whether the video should appear on pageload or not)
		// O/P: a video player
		// Status: re-written, untested
		value: function render() {
			var path = this.props.path;
			if (this.props.default) {
				// Video shown (paused) on page-load
				// 	className="player" - used for time-aligned syncing
				return React.createElement("video", { src: path, id: "video", className: "player", controls: true });
			} else {
				// Video hidden on page-load
				// 	className="hidden" - used by CSS, for display: none
				return React.createElement("video", { src: path, id: "video", className: "hidden", controls: true });
			}
		}
	}]);

	return Video;
}(React.Component);

var TitleInfo = function (_React$Component9) {
	_inherits(TitleInfo, _React$Component9);

	function TitleInfo() {
		_classCallCheck(this, TitleInfo);

		return _possibleConstructorReturn(this, (TitleInfo.__proto__ || Object.getPrototypeOf(TitleInfo)).apply(this, arguments));
	}

	_createClass(TitleInfo, [{
		key: "render",

		// I/P: title, a string
		// O/P: printed title
		// Status: tested, working
		value: function render() {
			var title = this.props.title;
			return React.createElement(
				"h3",
				{ id: "title" },
				title
			);
		}
	}]);

	return TitleInfo;
}(React.Component);

var TierCheckbox = function (_React$Component10) {
	_inherits(TierCheckbox, _React$Component10);

	// I/P: tier_id, a string like "T1" or "T15"
	//    tier_name, a string like "English Morphemes"
	// O/P: a checkbox with the ability to hide/show elements with tier-data={tier_id}
	// Status: tested, working
	function TierCheckbox(props) {
		_classCallCheck(this, TierCheckbox);

		var _this10 = _possibleConstructorReturn(this, (TierCheckbox.__proto__ || Object.getPrototypeOf(TierCheckbox)).call(this, props));

		_this10.state = {
			checkboxState: true
		};
		_this10.toggle = _this10.toggle.bind(_this10);
		return _this10;
	}

	_createClass(TierCheckbox, [{
		key: "toggle",
		value: function toggle(event) {
			this.setState({ checkboxState: !this.state.checkboxState });
			if (this.state.checkboxState) {
				$("tr[data-tier='" + this.props.tier_id + "']").css("display", "none");
			} else {
				$("tr[data-tier='" + this.props.tier_id + "']").css("display", "table-row");
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

var TierCheckboxList = function (_React$Component11) {
	_inherits(TierCheckboxList, _React$Component11);

	function TierCheckboxList() {
		_classCallCheck(this, TierCheckboxList);

		return _possibleConstructorReturn(this, (TierCheckboxList.__proto__ || Object.getPrototypeOf(TierCheckboxList)).apply(this, arguments));
	}

	_createClass(TierCheckboxList, [{
		key: "render",

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
				"div",
				{ id: "tierList" },
				tiersUiText,
				": ",
				React.createElement(
					"ul",
					null,
					output
				)
			);
		}
	}]);

	return TierCheckboxList;
}(React.Component);

var SpeakerInfo = function (_React$Component12) {
	_inherits(SpeakerInfo, _React$Component12);

	function SpeakerInfo() {
		_classCallCheck(this, SpeakerInfo);

		return _possibleConstructorReturn(this, (SpeakerInfo.__proto__ || Object.getPrototypeOf(SpeakerInfo)).apply(this, arguments));
	}

	_createClass(SpeakerInfo, [{
		key: "render",

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
							"li",
							{ key: speaker_id },
							speaker_display
						));
					}
				}
				return React.createElement(
					"div",
					{ id: "speakerList" },
					speakersUiText,
					": ",
					React.createElement(
						"ul",
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
	ReactDOM.render(React.createElement(TimedTextDisplay, { sentences: data["sentences"] }), document.getElementById("main"));
});

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

var Row = exports.Row = function (_React$Component) {
	_inherits(Row, _React$Component);

	function Row() {
		_classCallCheck(this, Row);

		return _possibleConstructorReturn(this, (Row.__proto__ || Object.getPrototypeOf(Row)).apply(this, arguments));
	}

	_createClass(Row, [{
		key: "render",

		// I/P: num_slots, taken from parent sentence
		//      values, list of segments (e.g., morphemes) with start/end times
		//      tier, the tier name
		// O/P: single row of glossed sentence, with colspan spacing
		// Status: tested, working
		value: function render() {
			var output = [];
			// Building a row requires slots to determine the width of certain
			// table elements. Each element will have a start and end slot, and 
			// if there is a gap between an end slot and the following start
			// slot, then a blank table element is input. We use the attribute
			// "colSpan" to account for elements which require large slots.

			// The current_slot counter is used to "fill in" the missing
			// slots when a dependent tier doesn't line up with its corresponding
			// independent tier. For example, if the i-tier goes from 0-12, and
			// the dependent tier goes from 2-5 and 7-12, then the current_slot
			// counter would be responsible for filling those gaps between 0-2
			// and 5-7.
			var current_slot = 0;

			var final_slot = this.props.num_slots;
			var values = this.props.values;
			var tier = this.props.tier;

			for (var i = 0; i < values.length; i++) {
				var v = values[i];
				var start_slot = v["start_slot"];
				var end_slot = v["end_slot"];
				var text = v["value"];

				// Add blank space before current value:
				if (start_slot > current_slot) {
					var diff = String(start_slot - current_slot);
					output.push(React.createElement("td", { key: 2 * i, colSpan: diff }));
				}
				// Create element with correct "colSpan" width:
				var size = String(end_slot - start_slot);
				output.push(React.createElement(
					"td",
					{ key: 2 * i + 1, colSpan: size },
					text
				));
				current_slot = end_slot;
			}
			// Fill blank space at end of table row:
			if (current_slot < final_slot) {
				var diff = String(final_slot - current_slot);
				output.push(React.createElement("td", { key: "final", colSpan: diff }));
			}
			return React.createElement(
				"tr",
				{ "data-tier": tier },
				output
			);
		}
	}]);

	return Row;
}(React.Component);

/***/ })
/******/ ]);