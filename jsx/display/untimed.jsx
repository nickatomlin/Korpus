import { Sentence } from "./sentence.jsx";

export class UntimedTextDisplay extends React.Component {
	// I/P: sentences, a list of sentences
	// O/P: the main gloss view, with several Sentences arranged vertically, each wrapped in an UntimedBlock
	// Status: tested, working
	render() {
		var sentences = this.props.sentences;
		var output = [];
		for (var i=0; i<sentences.length; i++) {
			var sentence = sentences[i];
			output.push(<div key={i} className="untimedBlock"><Sentence key={i} value={sentence}/></div>);
		}
		return <div className="untimedTextDisplay" id="td">{output}</div>;
	}
}