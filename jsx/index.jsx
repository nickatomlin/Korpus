import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
} from "react-router-dom";
import { UntimedTextDisplay } from './Display/Untimed.jsx';
import { TimedTextDisplay } from './Display/Timed.jsx';
import { Sidebar } from './Sidebar/Sidebar.jsx'

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

function CenterPanel({ timed, sentences }) {
	// I/P: timed, a boolean value
	//      sentences, a list of sentences
	// O/P: tested, working
	if (timed) {
		return <div id="centerPanel"><TimedTextDisplay sentences={sentences} /></div>;
	} else {
		return <div id="centerPanel"><UntimedTextDisplay sentences={sentences} /></div>;
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
	 	} else {
			return null;
	 	}
  	}
}

function StoryIndex() {
	return (
		<div>
			<h2>Imagine a list of stories.</h2>
			<Link to="/story">story link</Link>
		</div>
	);
}

function Story({ data }) {
    const sentences = data['sentences'];
    const timed = (data['metadata']['timed'] === 'true');
    return (
		<div>
			<Sidebar metadata={data['metadata']} />
			<CenterPanel timed={timed} sentences={sentences} />
		</div>
    );
}

function App({ data }) {
	return (
		<div>
			<Route exact path="/index" component={StoryIndex} />
			<Route exact path="/story" render={props => <Story data={data} />} />
		</div>
	);
}

function AppContainer({ data }) {
	return (
		<Router>
			<App data={data} />
		</Router>
	);
}

$.getJSON("data/json_files/Intro.json", function(data) {
	ReactDOM.render(
		<AppContainer data={data} />,
		document.getElementById("main")
	);
});