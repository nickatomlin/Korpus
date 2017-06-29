var data = {
  "metadata": {
    "tier IDs": {
      "T1": "A'ingae",
      "T2": "English",
      "T3": "Morphemes",
      "T4": "Glossed Morpheme"
    },
    "speaker IDs": {
      "S1": {
        "name": "Martin Criollo",
        "language": "con",
        "tier": "T1"
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
        output.push(<TierCheckbox tier_id={tier_id} tier_name={tiers[tier_id]}/>);
      }
    }
    return <ul>{output}</ul>;
  }
}

// class Settings extends React.Component {
// 	// I/P: metadata, in JSON format
// 	// O/P: a settings panel, with ordered tier names
//	// Status: unfinished
// }

ReactDOM.render(
	<TierCheckboxList tiers={data["metadata"]["tier IDs"]} />,
 	document.getElementById('settings')
);