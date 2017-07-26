import { SpeakerInfo } from './SpeakerInfo.jsx';

export function Info({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a nice display of speaker names + other metadata
	// Status: unfinished
	return (
		<div id="info" className="miniPage active">
			<SpeakerInfo speakers={metadata['speaker IDs']} />
		</div>
	);
}