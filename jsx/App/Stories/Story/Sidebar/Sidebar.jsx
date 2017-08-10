import { Title } from './Title.jsx';
import { Video } from './Video.jsx';
import { Minibar } from './Minibar/Minibar.jsx'

export function Sidebar({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a sidebar complement to the TextDisplay
	// Status: untested
	try {
		// Some KORPUS-specific code here (removing # from title):
		let title = metadata['title']['con-Latn-EC'];
		if (!metadata['timed']) {
			title = title.substr(title.indexOf(" ") + 1);
		}
		const filename = metadata['media']['mp4'];
		const path = 'data/media_files/' + filename;
		return (
			<div id="leftPanel">
				<Video path={path} />
				<Title title={title} />
				<Minibar metadata={metadata} hasVideo={metadata["timed"]} />
			</div>
		);
	} catch (err) {
		return (
			<div id="leftPanel">
				<Title title={metadata['title']} />
				<Minibar metadata={metadata} />
			</div>
		);
	}
}