import { TierCheckboxList } from './TierCheckboxList.jsx';
import { Video } from './../../Video.jsx';

class VideoButton extends React.Component {
  // I/P: --
  // O/P: a button that can show/hide video, reset "player" ID, etc.
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

    if (!this.state.checkboxState) {
      Video.show();
    } else {
      Video.hide();
    }
  }

  render() {
    return <div id="videoButton"><input type="checkbox" defaultChecked onClick={this.toggle} /><label>Show video</label></div>;
  }
}

export function Settings({ tiers, hasVideo }) {
	// I/P: tiers, a hashmap from Tier ID to {name, subdivided}
	//      hasVideo, a boolean
	// O/P: a search bar with concordance functionality
	// Status: untested
  let videoButton = null;
  if (hasVideo) {
    videoButton = <VideoButton />;
  }

	return (
		<div id="settings" className="miniPage">
			<TierCheckboxList tiers={tiers} />
			{videoButton}
		</div>
	);
}