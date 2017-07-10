var data = {
  "metadata": {
    "tier IDs": {
      "T1": "Lise Dobrin",
      "T2": "Scola Sonin",
      "T3": "Scola Sonin TP Gloss"
    },
    "speaker IDs": {
      "S1": {
        "name": "Lise Dobrin",
        "tier": "T1"
      },
      "S2": {
        "name": "Scola Sonin",
        "tier": "T2"
      }
    }
  }
};

class TierCheckbox extends React.Component {
	// I/P: tier_id, a string like "T1" or "T15"
	//		tier_name, a string like "English Morphemes"
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
		return <li><input type="checkbox" onClick={this.toggle} defaultChecked /><label>{tier_name}</label></li>;
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
    return <div>Tiers to show: <ul>{output}</ul></div>;
  }
}

class TitleInfo extends React.Component {
  // I/P: title, a string
  // O/P: printed title
  // Status: tested, working
  render() {
    var title = this.props.title;
    return <h3>{title}</h3>;
  }
}

class SpeakerInfo extends React.Component {
  // I/P: speakers, a map from speaker IDs to objects containing speaker names, languages, etc.
  // O/P: some nicely formatted info about these speakers
  // Status: tested, working
  render() {
    var speaker_list = [];
    var speakers = this.props.speakers;
    for (var speaker_id in speakers) {
      if (speakers.hasOwnProperty(speaker_id)) {
        var speaker_name = speakers[speaker_id]["name"];
        var speaker_display = speaker_id + ": " + speaker_name;
        speaker_list.push(<li key={speaker_id}>{speaker_display}</li>);
      }
    }
    return <div>Speakers: <ul>{speaker_list}</ul></div>;
  }
}

class Settings extends React.Component {
 	// I/P: metadata, in JSON format
 	// O/P: a settings/metadata panel
	// Status: tested, working
  render() {
    var metadata = this.props.metadata;
    var title = metadata["title"];
    return <div id="settings"><TitleInfo title={title}/><SpeakerInfo speakers={metadata["speaker IDs"]}/><TierCheckboxList tiers={metadata["tier IDs"]}/></div>;
  }
}

ReactDOM.render(
	<Settings metadata={data["metadata"]} />,
 	document.getElementById('leftPanel')
);