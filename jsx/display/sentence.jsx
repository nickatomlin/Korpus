var id = require('shortid');

function Row({ num_slots, values, tier }) {
	// I/P: num_slots, taken from parent sentence
	//      values, list of segments (e.g., morphemes) with start/end times
	//      tier, the tier name
	// O/P: single row of glossed sentence, with colspan spacing
	// Status: tested, working

	// Building a row requires slots to determine the width of certain
	// table elements. Each element will have a start and end slot, and 
	// if there is a gap between an end slot and the following start
	// slot, then a blank table element is input. We use the attribute
	// 'colSpan' to account for elements which require large slots.

	// The current_slot counter is used to 'fill in' the missing
	// slots when a dependent tier doesn't line up with its corresponding
	// independent tier. For example, if the i-tier goes from 0-12, and
	// the dependent tier goes from 2-5 and 7-12, then the current_slot
	// counter would be responsible for filling those gaps between 0-2
	// and 5-7.
	const final_slot = num_slots;
	let current_slot = 0;
	let output = [];

	for (let i=0; i<values.length; i++) {
		const v = values[i];
		const start_slot = v['start_slot'];
		const end_slot = v['end_slot'];
		const text = v['value'];

		// Add blank space before current value:
		if (start_slot > current_slot) {
			const diff = String(start_slot - current_slot);
			output.push(<td key={id.generate()} colSpan={diff}></td>);
		}
		// Create element with correct 'colSpan' width:
		const size = String(end_slot - start_slot);
		output.push(<td key={id.generate()} colSpan={size}>{text}</td>);
		current_slot = end_slot;
	}
	// Fill blank space at end of table row:
	if (current_slot < final_slot) {
		const diff = String(final_slot - current_slot);
		output.push(<td key={id.generate()} colSpan={diff}></td>);
	}
	return <tr data-tier={tier}>{output}</tr>;
}

export class Sentence extends React.Component {
	// I/P: value, a sentence
	// O/P: table of glossed Row components
	// Status: tested, working
	render() {
		let row_list = []; // to be output
		const sentence = this.props.value;
		const num_slots = sentence['num_slots'];
		// Add the indepentent tier, i.e., the top row, to the list of rows. Note that
		// 'colSpan={num_slots}' ensures that this row spans the entire table.
		row_list.push(<tr key={id.generate()} data-tier={sentence['tier']}><td colSpan={num_slots} className='topRow'>{sentence['text']}</td></tr>);
		const dependents = sentence['dependents']; // list of dependent tiers, flat structure
		// Add each dependent tier to the row list:
		for (let i=0; i<dependents.length; i++) {
			const dependent = dependents[i];
			// Tier attribute will be used for hiding/showing tiers:
			const tier = dependent['tier'];
			row_list.push(<Row key={id.generate()} num_slots={num_slots} values={dependent['values']} tier={tier} />);
		}
		return <table className="gloss"><tbody>{row_list}</tbody></table>;
	}
}