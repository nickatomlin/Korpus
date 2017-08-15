import { Title } from './Title.jsx';
import { Video } from './Video.jsx';
import { Minibar } from './Minibar/Minibar.jsx'

export function Sidebar({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a sidebar complement to the TextDisplay
	// Status: untested

	// Some KORPUS-specific code here (removing # from title):
	let title = metadata['title']['con-Latn-EC'];
	if (metadata['title']['_default'] != '') {
		title = metadata['title']['_default'];
	}
	if (!metadata['timed']) {
		title = title.substr(title.indexOf(" ") + 1);
	}

	try {
		const filename = metadata['media']['video'];
		const path = 'data/media_files/' + filename;
		return (
			<div id="leftPanel">
				<Video path={path} />
				<Title title={title} />
				<Minibar metadata={metadata} hasVideo />
			</div>
		);
	} catch (err) {
		return (
			<div id="leftPanel">
				<Title title={title} />
				<Minibar metadata={metadata} hasVideo={false} />
			</div>
		);
	}
}