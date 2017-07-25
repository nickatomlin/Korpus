import id from 'shortid';

function Row({ numSlots, values, tier }) {
	// I/P: numSlots, taken from parent sentence
	//      values, list of segments (e.g., morphemes) with start/end times
	//      tier, the tier name
	// O/P: single row of glossed sentence, with colspan spacing
	// Status: tested, working

	// Building a row requires slots to determine the width of certain
	// table elements. Each element will have a start and end slot, and 
	// if there is a gap between an end slot and the following start
	// slot, then a blank table element is input. We use the attribute
	// 'colSpan' to account for elements which require large slots.

	// The currentSlot counter is used to 'fill in' the missing
	// slots when a dependent tier doesn't line up with its corresponding
	// independent tier. For example, if the i-tier goes from 0-12, and
	// the dependent tier goes from 2-5 and 7-12, then the currentSlot
	// counter would be responsible for filling those gaps between 0-2
	// and 5-7.
	const finalSlot = numSlots;
	let currentSlot = 0;
	let output = [];

	for (const v of values) {
		const startSlot = v['start_slot'];
		const endSlot = v['end_slot'];
		const text = v['value'];

		// Add blank space before current value:
		if (startSlot > currentSlot) {
			const diff = String(startSlot - currentSlot);
			output.push(<td key={id.generate()} colSpan={diff} />);
		}
		// Create element with correct 'colSpan' width:
		const size = String(endSlot - startSlot);
		output.push(<td key={id.generate()} colSpan={size}>{text}</td>);
		currentSlot = endSlot;
	}
	// Fill blank space at end of table row:
	if (currentSlot < finalSlot) {
		const diff = String(finalSlot - currentSlot);
		output.push(<td key={id.generate()} colSpan={diff} />);
	}
	return <tr data-tier={tier}>{output}</tr>;
}

export function Sentence({ sentence }) {
	// I/P: sentence, a sentence
	// O/P: table of glossed Row components
	// Status: tested, working
	let rowList = []; // to be output
	const numSlots = sentence['num_slots'];
	// Add the indepentent tier, i.e., the top row, to the list of rows. Note that
	// 'colSpan={numSlots}' ensures that this row spans the entire table.
	rowList.push(
		<tr data-tier={sentence['tier']}>
			<td colSpan={numSlots} className="topRow">{sentence['text']}</td>
		</tr>
	);
	const dependents = sentence['dependents']; // list of dependent tiers, flat structure
	// Add each dependent tier to the row list:
	for (const {values, tier} of dependents) {
		// Tier attribute will be used for hiding/showing tiers:
		rowList.push(<Row key={id.generate()} numSlots={numSlots} values={values} tier={tier} />);
	}
	return <table className="gloss"><tbody>{rowList}</tbody></table>;
}