import { Info } from './Info/Info.jsx';
import { Settings } from './Settings/Settings.jsx';

export function Minibar({ metadata, hasVideo }) {
	// I/P: metadata, in JSON format
	//      hasVideo, a boolean
	// O/P: description and tier checkboxes
	// Status: tested, working

	return (
		<div id="minibar">
    		<div id="miniPage">
	    		<Info metadata={metadata} />
	    		<Settings tiers={metadata['tier IDs']} hasVideo={hasVideo} />
	    	</div>
		</div>
	);
}