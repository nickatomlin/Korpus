import { TierCheckboxList } from './TierCheckboxList.jsx';

export function Settings({ tiers, hasVideo }) {
	// I/P: tiers, a hashmap from Tier IDs to their names
	//      hasVideo, a boolean
	// O/P: a search bar with concordance functionality
	// Status: unfinished
	return (
		<div id="settings" className="miniPage hide">
			<TierCheckboxList tiers={tiers} />
		</div>
	);
}