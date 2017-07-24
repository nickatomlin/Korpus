import { UntimedTextDisplay } from './text_display/untimed_text_display.jsx';
import { TimedTextDisplay } from './text_display/timed_text_display.jsx';

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

class CenterPanel extends React.Component {
	// I/P: timed, a boolean value
	//      sentences, a list of sentences
	// O/P: untested
	render() {
		if (this.props.timed) {
			return <div id="centerPanel"><TimedTextDisplay sentences={this.props.sentences}/></div>;
		}
		else {
			return <div id="centerPanel"><UntimedTextDisplay sentences={this.props.sentences}/></div>;
		}
	}
}

// SETTINGS + VIDEO PANEL

class Video extends React.Component {
	// I/P: path, the path to the video
	//		  default, a boolean value (whether the video should appear on pageload or not)
	// O/P: a video player
	// Status: re-written, untested
	render() {
		var path = this.props.path;
		if (this.props.default) {
			// Video shown (paused) on page-load
			// 	className="player" - used for time-aligned syncing
			return <video src={path} id="video" className="player" controls></video>;
		}
		else {
			// Video hidden on page-load
			// 	className="hidden" - used by CSS, for display: none
			return <video src={path} id="video" className="hidden" controls></video>;
		}
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

class TierCheckbox extends React.Component {
  // I/P: tier_id, a string like "T1" or "T15"
  //    tier_name, a string like "English Morphemes"
  // O/P: a checkbox with the ability to hide/show elements with tier-data={tier_id}
  // Status: tested, working
  constructor(props) {
    super(props);
    this.state = {
      checkboxState: true
    };
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
    return <li><input type="checkbox" onClick={this.toggle} defaultChecked/><label>{tier_name}</label></li>;
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

class SpeakerInfo extends React.Component {
  // I/P: speakers, a map from speaker IDs to objects containing speaker names, languages, etc.
  // O/P: some nicely formatted info about these speakers
  // Status: tested, working
  render() {
    var speaker_list = [];
    var speakers = this.props.speakers;
    if (speakers != null) {
      for (var speaker_id in speakers) {
        if (speakers.hasOwnProperty(speaker_id)) {
          var speaker_name = speakers[speaker_id]["name"];
          var speaker_display = speaker_id + ": " + speaker_name;
          speaker_list.push(<li key={speaker_id}>{speaker_display}</li>);
        }
      }
      return <div id="speakerList">{speakersUiText}: <ul>{speaker_list}</ul></div>;
    }
    else {
      return null;
    }
  }
}

function showVideo() {
	// do stuff
}

$.getJSON("data/aldar/5459352f3b9eb1d2b71071a7f40008ef", function(data) {
	ReactDOM.render(
		<TimedTextDisplay sentences={data["sentences"]}/>,
		document.getElementById("main")
	);
});