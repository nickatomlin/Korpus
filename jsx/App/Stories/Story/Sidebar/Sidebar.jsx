import { Title } from './Title.jsx';
import { Video } from './Video.jsx';
import { Minibar } from './Minibar/Minibar.jsx'

export function Sidebar({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a sidebar complement to the TextDisplay
	// Status: untested
	try {
		const filename = metadata['media']['mp4'];
		const path = 'data/media_files/' + filename;
		return (
			<div id="leftPanel">
				<Video path={path} />
				<Title title={metadata['title']} />
				<Minibar metadata={metadata} hasVideo />
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