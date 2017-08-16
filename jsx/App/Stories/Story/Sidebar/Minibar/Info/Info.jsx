import { SpeakerInfo } from './SpeakerInfo.jsx';
import { Metadata } from './Metadata.jsx';

export function Info({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a nice display of speaker names + other metadata
	// Status: unfinished
	return (
		<div id="info" className="miniPage active">
			<Metadata metadata={metadata} />
			<SpeakerInfo speakers={metadata['speaker IDs']} />
		</div>
	);
}