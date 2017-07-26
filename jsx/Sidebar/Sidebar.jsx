import { Title } from './Title.jsx';
import { Video } from './Video.jsx';

export function Sidebar({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a sidebar complement to the TextDisplay
	// Status: unfinished
	try {
		const filename = metadata['media']['mp4'];
		const path = '/data/media_files/' + filename;
		console.log(path);
		return (
			<div id="leftPanel">
				<Title title={metadata['title']} />
				<Video path={path} />
			</div>
		);
	} catch (err) {
		console.log(err);
		return (
			<div id="leftPanel">
				<Title title={metadata['title']} />
			</div>
		);
	}
}