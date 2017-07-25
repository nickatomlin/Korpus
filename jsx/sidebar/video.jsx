export class Video extends React.Component {
	// I/P: path, the path to the video
	//		default, a boolean value (whether the video should appear on pageload or not)
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

	show() {
		
	}

	hide() {
		
	}
}