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

// SETTINGS:  VIDEO
//            TIERCHECKBOX
//            TIERCHECKBOXLIST
//            TITLEINFO
//            SPEAKERINFO
//            VIDEOBUTTON
//            SETTINGS

class TierCheckbox extends React.Component {
  // I/P: tier_id, a string like "T1" or "T15"
  //    tier_name, a string like "English Morphemes"
  // O/P: a checkbox with the ability to hide/show elements with tier-data={tier_id}
  // Status: tested, working
  constructor(props) {
    super(props);
    var tier_name = this.props.tier_name;
    if (tier_name == "Parte del habla inglés" || tier_name == "Morfema (forma típico) a'ingae" || tier_name == "Frase inglés" || tier_name == "Glosa de morfema inglés") {
      this.state = {
        checkboxState: false
      };
      $("tr[data-tier='" + this.props.tier_id + "']").css("display", "none");
    }
    else {
      this.state = {
        checkboxState: true
      };
    }
    this.toggle = this.toggle.bind(this);
  }

  toggle(event) {
    this.setState({checkboxState: !this.state.checkboxState});

    if (this.state.checkboxState) {
      $("tr[data-tier='" + this.props.tier_id + "']").css("display", "none");
    }
    else {
      $("tr[data-tier='" + this.props.tier_id + "']").css("display", "table-row");
    }
  }

  render() {
    var tier_id = this.props.tier_id;
    var tier_name = this.props.tier_name;
    if (tier_name == "hn inglés" || tier_name == "variantTypes inglés") {
      $("tr[data-tier='" + this.props.tier_id + "']").css("display", "none");
      return <span></span>;
    }
    else {
      return <li><input type="checkbox" onClick={this.toggle} defaultChecked={this.state.checkboxState} /><label>{tier_name}</label></li>;
    }
  }
}

class TierCheckboxList extends React.Component {
  // I/P: tiers, a hashmap from Tier IDs to their names
  // O/P: an unordered list of TierCheckboxes
  // Status: tested, working
  render() {
    var output = [];
    var tiers = this.props.tiers;
    for (var tier_id in tiers) {
      if (tiers.hasOwnProperty(tier_id)) {
        output.push(<TierCheckbox key={tier_id} tier_id={tier_id} tier_name={tiers[tier_id]}/>);
      }
    }
    return <div id="tierList">{tiersUiText}: <ul>{output}</ul></div>;
  }
}

class TitleInfo extends React.Component {
  // I/P: title, a string
  // O/P: printed title
  // Status: tested, working
  render() {
    var title = this.props.title;
    return <h3 id="title">{title}</h3>;
  }
}

class Settings extends React.Component {
  // I/P: metadata, in JSON format
  //      mp3, a boolean value
  //      mp4, a boolean value  
  // O/P: a settings/metadata panel
  // Status: tested, working
  render() {
    var metadata = this.props.metadata;
    var title = metadata.title;
    var media = metadata.media;
    
    var videoOrEmpty = <span></span>;
    var buttonOrEmpty = <span></span>;
    
    /*var hasVideo = (media != null && media.mp4 != null);
    var hasAudio = (media != null && media.mp3 != null);
    
    if (hasVideo) { // has video
      var vidUrl = "./data/media_files/" + media.mp4;
      videoOrEmpty = <Video vidUrl={vidUrl} canHide={hasAudio}/>;
      if (hasAudio) {
        buttonOrEmpty = <VideoButton/>;
      }
    }*/
    
    return <div>{videoOrEmpty}<div id="settings"><TitleInfo title={title}/><SpeakerInfo speakers={metadata["speaker IDs"]}/><TierCheckboxList tiers={metadata["tier IDs"]}/>{buttonOrEmpty}</div></div>;
  }
}

// TEXT DISPLAY:  ROW
//                SENTENCE
//                UNTIMEDTEXTDISPLAY
//                LABELEDSENTENCE
//                TIMEBLOCK
//                LABELEDTIMEBLOCK
//                TIMEDTEXTDISPLAY
// Function: displayText(filename)

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
    if (this.props.isTimeAligned) {
      return <table className="gloss" data-isTimeAligned="true"><tbody>{row_list}</tbody></table>;
    } else if (this.props.isFinalSentence) {
      return <table className="gloss" data-isTimeAligned="false" data-isFinalBlock="true"><tbody>{row_list}</tbody></table>;
    } else {
      return <table className="gloss" data-isTimeAligned="false"><tbody>{row_list}</tbody></table>;
    }
  }
}

class UntimedTextDisplay extends React.Component {
  // I/P: data, stored in JSON format, as in test_data.json
  // O/P: the main gloss view, with several Sentences arranged vertically
  // Status: tested, working
  render() {
    var sentences = this.props.data["sentences"];
    var output = [];
    for (var i=0; i<sentences.length; i++) {
      var sentence = sentences[i];
      if (i == (sentences.length - 1)) {
        output.push(<div key={i} className="UntimedBlock"><Sentence key={i} value={sentence} isTimeAligned={false} isFinalSentence={true}/></div>);
      } else {
        output.push(<div key={i} className="UntimedBlock"><Sentence key={i} value={sentence} isTimeAligned={false}/></div>);
      }
    }
    return <div className="untimedTextDisplay" id="td">{output}</div>;
  }
}

function clearDisplay() {
  $("#index").css("display", "none");
  $("#leftPanel").css("width", "240px");
}

function displayText(fileName) {
  var fileName = "./data/json_files/" + fileName + ".json";
  clearDisplay();
  $.getJSON(fileName, function(data) {
    // CASE 4: UNTIMED
    ReactDOM.render(
      <span></span>,
      document.getElementById('footer')
    );
    ReactDOM.render(
      <UntimedTextDisplay data={data}/>,
      document.getElementById('centerPanel')
    );
    ReactDOM.render(
      <Settings metadata={data["metadata"]} timed={false} />,
      document.getElementById('leftPanel')
    );
    // Responsive body height based on height of audio player, which differs by browser.
    var footheight = ($("#footer").height() + 48).toString() + "px";
    var bodyheight = "calc( 100% - " + footheight + " )";
    $(".untimedTextDisplay").css("height", bodyheight);
    $("#leftPanel").css("height", bodyheight);
  })
}

// INDEX.JSX
// -> Moved here for bundling.
class DocLink extends React.Component {
  // I/P: fileName, the filename (including file extension, excluding file path) of the document
  //      text, the title that will actually be displayed
  // O/P: a button to view that document
  // Status: tested, working
  render () {
    var fileName = this.props.fileName;
    var encodedFileName = encodeURI(fileName);
    return <li><a className="docLink" href={"#/story/" + encodedFileName} data-button_text={fileName}>{this.props.text}</a></li>;
  }
}

class IndexDisplay extends React.Component {
  // I/P: index, a list of the JSON index metadata for each document
  // O/P: a list of buttons, one to view each document
  // Status: tested, working
  render () {
    var files = this.props.data;
    var output = [];
    for (var i=0; i<files.length; i++) {
      var fileName = files[i]["title from filename"];
      var displayName = files[i]["display_title"];
      output.push(<DocLink key={i} fileName={fileName} text={displayName}/>);
    }
    return <div id="index" style={{margin: "20px"}}>{storyListUiText}: <ul className="indexDisplay">{output}</ul></div>;
  }
}

function showIndex() {
  $("#index").css("display", "block");
  $("#leftPanel").css("width", "100%");
  $.getJSON("./data/index.json", function(data) {
    ReactDOM.render(
      <IndexDisplay data={data}/>,
      document.getElementById('leftPanel')
    );
    ReactDOM.render(
      <span></span>,
      document.getElementById('centerPanel')
    );
    ReactDOM.render(
      <span></span>,
      document.getElementById('footer')
    )
    $(".docLink").click(function() {
      displayText($(this).data('button_text'));
    });
  });
}

// HASH.JS
// -> Moved here for bundling.
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
