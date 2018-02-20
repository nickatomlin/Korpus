import { SpeakerInfo } from './SpeakerInfo.jsx';
import { Metadata } from './Metadata.jsx';
import { MoreMetadata } from './Metadata.jsx';

export function Info({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a nice display of speaker names + other metadata
	// Status: finished
	return (
		<div id="info" className="miniPage active">
			<Metadata metadata={metadata} />
			<SpeakerInfo speakers={metadata['speaker IDs']} />
		</div>
	);
}

export function MoreInfo({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: glossing and source information
	// Status: finished
	return (
		<div id="info" className="miniPage active">
			<MoreMetadata metadata={metadata} />
		</div>
	);
}