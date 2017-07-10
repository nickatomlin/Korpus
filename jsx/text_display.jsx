// Code begins at line 2896, data temporarily stored inline.

class Row extends React.Component {
  // I/P: num_slots, taken from parent sentence
  //      values, list of segments (e.g., morphemes) with start/end times
  //      tier, the tier name
  // O/P: single row of glossed sentence, with colspan spacing
  // Status: tested, working
  render() {
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

    for (var i=0; i<values.length; i++) {
      var v = values[i];
      var start_slot = v["start_slot"];
      var end_slot = v["end_slot"];
      var text = v["value"];

      // Add blank space before current value:
      if (start_slot > current_slot) {
        var diff = String(start_slot - current_slot);
        output.push(<td key={2*i} colSpan={diff}></td>);
      }
      // Create element with correct "colSpan" width:
      var size = String(end_slot - start_slot);
      output.push(<td key={2*i+1} colSpan={size}>{text}</td>);
      current_slot = end_slot;
    }
    // Fill blank space at end of table row:
    if (current_slot < final_slot) {
      var diff = String(final_slot - current_slot);
      output.push(<td key={"final"} colSpan={diff}></td>);
    }
    return <tr data-tier={tier}>{output}</tr>;
  }
}

class Sentence extends React.Component {
  // I/P: value, a sentence
  // O/P: table of glossed Row components
  // Status: tested, working
  render() {
    var row_list = []; // to be output
    var sentence = this.props.value;
    var num_slots = sentence["num_slots"];
    // Add the indepentent tier, i.e., the top row, to the list of rows. Note that
    // "colSpan={num_slots}" ensures that this row spans the entire table.
    row_list.push(<tr key={0} data-tier={sentence["tier"]}><td colSpan={num_slots} className="topRow">{sentence["text"]}</td></tr>);
    var dependents = sentence["dependents"]; // list of dependent tiers, flat structure
    // Add each dependent tier to the row list:
    for (var i=0; i<dependents.length; i++) {
      var dependent = dependents[i];
      // Tier attribute will be used for hiding/showing tiers:
      var tier = dependent["tier"];
      row_list.push(<Row key={i+1} num_slots={num_slots} values={dependent["values"]} tier={tier} />);
    }
    return <table className="gloss"><tbody>{row_list}</tbody></table>;
  }
}

class LabeledSentence extends React.Component {
  // I/P: value, a sentence
  // O/P: glossed sentence with speaker label
  // Status: tested, working
  render() {
    var sentence = this.props.value;
    var label = sentence["speaker"];
    return <div className="labeledSentence"><span className="speakerLabel">{label}: </span><Sentence value={sentence} /></div>;
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
      output.push(<LabeledSentence key={i} value={sentence}/>)
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
    if (isFinalBlock) {
      return <div className="labeledTimeBlock" data-start_time={min_start} data-end_time={max_end} data-isFinalBlock="true"><span className="timeStamp">{timestamp}</span><TimeBlock sentences={sentences}/></div>;
    }
    else {
      return <div className="labeledTimeBlock" data-start_time={min_start} data-end_time={max_end}><span className="timeStamp">{timestamp}</span><TimeBlock sentences={sentences}/></div>;
    }
  }
}

class TextDisplay extends React.Component {
  // I/P: data, stored in JSON format, as in test_data.json
  // O/P: the main gloss view, with several LabeledTimeBlocks arranged vertically
  // Status: tested, working
  // Note: very dependent on correct formatting of data
  render() {
    var output = [];
    var sentences = this.props.data["sentences"];

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
      if (i == (unique_timestamps.length - 1)) {
        output.push(<LabeledTimeBlock key={i} sentences={corresponding_sentences} timestamp={timestamp} isFinalBlock={true} />);
      }
      else {
        output.push(<LabeledTimeBlock key={i} sentences={corresponding_sentences} timestamp={timestamp}/>);
      }
    }
    return <div className="textDisplay" id="td">{output}</div>;
  }
}

$.getJSON( "./data/json_files/Intro.json", function(data) {
  ReactDOM.render(
  <TextDisplay data={data}/>,
  document.getElementById('centerPanel')
);
})