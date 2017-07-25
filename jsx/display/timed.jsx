import id from 'shortid';
import { Sentence } from './Sentence.jsx';

function LabeledSentence({ sentence }) {
	// I/P: sentence, a sentence
	// O/P: glossed sentence with speaker label
	// Status: tested, working
	const label = sentence['speaker'];
	return (
		<div className="labeledSentence">
			<span className="speakerLabel">{label}: </span>
			<Sentence sentence={sentence} isTimeAligned />
		</div>
	);
}

function TimeBlock({ sentences }) {
	// I/P: sentences, a list of sentences with the same start time
	// O/P: div containing multiple LabeledSentences
	// Status: tested, working
	let output = [];
	// A timeblock may contain multiple sentences with the same start time.
	// Iterate through the list of these sentences.
	for (let i=0; i<sentences.length; i++) {
		const sentence = sentences[i];
		output.push(<LabeledSentence key={id.generate()} sentence={sentence} />);
	}
	return <div className="timeBlock">{output}</div>;
}

function printSeconds(r) {
	// I/P: an integer number of seconds
	// O/P: time interval in h:mm:s or m:ss format (a string)
	// Status: tested, working
	r=Number(r);var t=Math.floor(r/3600),i=Math.floor(r%3600/60),n=Math.floor(r%3600%60);if(n>=10)e=String(n);else var e="0"+String(n);var o=String(i)+":";if(0==t)a="";else if(i>=10)a=String(t)+":";else var a=String(t)+":0";return a+o+e;
}

function LabeledTimeBlock({ sentences, timestamp }) {
	// I/P: sentences, a list of sentences with the same start time
	//      timestamp, an integer number of seconds
	// O/P: a TimeBlock with a left-floating timestamp
	// Status: tested, working
	timestamp = printSeconds(timestamp);
	// Return the actual start and end time of this block in ms. Note that end times may differ,
	// so take the latest endtime of any sentence in this timeblock. These will be used in attributes
	// to render the current block in time with audio/video.
	let minStart = Number.POSITIVE_INFINITY;
	let maxEnd = Number.NEGATIVE_INFINITY;
	for (let i=0; i<sentences.length; i++) {
		const sentence = sentences[i];
		const startTime = sentence["start_time_ms"];
		const endTime = sentence["end_time_ms"];
		if (startTime < minStart) {
			minStart = startTime;
		}
		if (endTime > maxEnd) {
			maxEnd = endTime;
		}
	}
	return (
		<div className="labeledTimeBlock" data-startTime={minStart} data-endTime={maxEnd}>
			<span className="timeStampContainer">
				<a href="javascript:void(0)" data-startTime={minStart} className="timeStamp">{timestamp}</a>
			</span>
			<TimeBlock sentences={sentences} />
		</div>
	);
}

export function TimedTextDisplay({ sentences }) {
	// I/P: sentences, stored in JSON format, as in test_data.json
	// O/P: the main gloss view, with several LabeledTimeBlocks arranged vertically
	// Status: tested, working
	// Note: very dependent on correct formatting of data
	let output = [];

	// Steps to create ordered, unique TimeBlocks:
	//  1) Create a hashmap from start_times (in sec) to lists of sentences
	//  2) Sort the keys of this hashmap (stored in unique_timestamps)
	//  3) Each key-value pair corresponds to a unique TimeBlock

	let times_to_sentences = {}; // hashmap from timestamps (in sec) to lists of sentences
	let unique_timestamps = []; // for sorting keys
	for (let i=0; i<sentences.length; i++) {
		const sentence = sentences[i];
		const timestamp_ms = sentence["start_time_ms"];
		const timestamp_sec = Math.floor(timestamp_ms / 1000); // msec -> sec
		if (timestamp_sec in times_to_sentences) {
			times_to_sentences[timestamp_sec].push(sentence);
		}
		else {
			unique_timestamps.push(timestamp_sec);
			times_to_sentences[timestamp_sec] = [sentence];
		}
	}
	unique_timestamps.sort((a, b) => a - b); // to avoid alphanumeric sorting
	for (let i=0; i<unique_timestamps.length; i++) {
		const timestamp = unique_timestamps[i];
		const corresponding_sentences = times_to_sentences[timestamp];
		output.push(<LabeledTimeBlock key={id.generate()} sentences={corresponding_sentences} timestamp={timestamp} />);
	}
	return <div id="timedTextDisplay">{output}</div>;
}