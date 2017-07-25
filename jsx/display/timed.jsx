import { Sentence } from "./sentence.jsx";

class LabeledSentence extends React.Component {
	// I/P: value, a sentence
	// O/P: glossed sentence with speaker label
	// Status: tested, working
	render() {
		var sentence = this.props.value;
		var label = sentence["speaker"];
		return <div className="labeledSentence"><span className="speakerLabel">{label}: </span><Sentence value={sentence} isTimeAligned={true}/></div>;
	}
}

class TimeBlock extends React.Component {
	// I/P: sentences, a list of sentences with the same start time
	// O/P: div containing multiple LabeledSentences
	// Status: tested, working
	render() {
		var sentences = this.props.sentences;
		var output = [];
		// A timeblock may contain multiple sentences with the same start time.
		// Iterate through the list of these sentences.
		for (var i=0; i<sentences.length; i++) {
			var sentence = sentences[i];
			output.push(<LabeledSentence key={i} value={sentence}/>);
		}
		return <div className="timeBlock">{output}</div>;
	}
}

// I/P: an integer number of seconds
// O/P: time interval in h:mm:s or m:ss format
// Status: tested, working
function printSeconds(r){r=Number(r);var t=Math.floor(r/3600),i=Math.floor(r%3600/60),n=Math.floor(r%3600%60);if(n>=10)e=String(n);else var e="0"+String(n);var o=String(i)+":";if(0==t)a="";else if(i>=10)a=String(t)+":";else var a=String(t)+":0";return a+o+e}

class LabeledTimeBlock extends React.Component {
	// I/P: sentences, a list of sentences with the same start time
	//      timestamp, an integer number of seconds
	//      isFinalBlock, a boolean value
	// O/P: a TimeBlock with a left-floating timestamp
	// Status: tested, working
	render() {
		var sentences = this.props.sentences;
		var timestamp = printSeconds(this.props.timestamp);
		var isFinalBlock = this.props.isFinalBlock;
		// Return the actual start and end time of this block in ms. Note that end times may differ,
		// so take the latest endtime of any sentence in this timeblock. These will be used in attributes
		// to render the current block in time with audio/video.
		var min_start = Number.POSITIVE_INFINITY;
		var max_end = Number.NEGATIVE_INFINITY;
		for (var i=0; i<sentences.length; i++) {
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
		return <div className="labeledTimeBlock" data-start_time={min_start} data-end_time={max_end}><span className="timeStampContainer"><a href="javascript:void(0)" data-start_time={min_start} className="timeStamp">{timestamp}</a></span><TimeBlock sentences={sentences}/></div>;
	}
}

export class TimedTextDisplay extends React.Component {
	// I/P: sentences, stored in JSON format, as in test_data.json
	// O/P: the main gloss view, with several LabeledTimeBlocks arranged vertically
	// Status: tested, working
	// Note: very dependent on correct formatting of data
	render() {
		var output = [];
		var sentences = this.props.sentences;

		// Steps to create ordered, unique TimeBlocks:
		//  1) Create a hashmap from start_times (in sec) to lists of sentences
		//  2) Sort the keys of this hashmap (stored in unique_timestamps)
		//  3) Each key-value pair corresponds to a unique TimeBlock

		var times_to_sentences = {}; // hashmap from timestamps (in sec) to lists of sentences
		var unique_timestamps = []; // for sorting keys
		for (var i=0; i<sentences.length; i++) {
			var sentence = sentences[i];
			var timestamp_ms = sentence["start_time_ms"];
			var timestamp_sec = Math.floor(timestamp_ms / 1000); // msec -> sec
			if (timestamp_sec in times_to_sentences) {
				times_to_sentences[timestamp_sec].push(sentence);
			}
			else {
				unique_timestamps.push(timestamp_sec);
				times_to_sentences[timestamp_sec] = [sentence];
			}
		}
		unique_timestamps.sort((a, b) => a - b); // to avoid alphanumeric sorting
		for (var i=0; i<unique_timestamps.length; i++) {
			var timestamp = unique_timestamps[i];
			var corresponding_sentences = times_to_sentences[timestamp];
			output.push(<LabeledTimeBlock key={i} sentences={corresponding_sentences} timestamp={timestamp}/>);
		}
		return <div id="timedTextDisplay">{output}</div>;
	}
}