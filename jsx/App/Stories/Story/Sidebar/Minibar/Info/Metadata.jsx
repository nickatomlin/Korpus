export function Metadata({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a nice display of speaker names + other metadata
	// Status: unfinished
	let description = null;
	let author = null;
	let glosser = null;
	let source = null;
	let genre = null;
	let date_created = null;

	if (metadata["description"] != "") {
		description = <p><b>Description:</b> {metadata["description"]}</p>;
	}

	if (metadata["author"] != "") {
		author = <p>Author: {metadata["author"]}</p>;
	}

	if (metadata["glosser"] != "") {
		glosser = <p>Glosser: {metadata["glosser"]}</p>;
	}

	if (metadata["source"]["_default"] != "") {
		source = <p>Source: {metadata["source"]["_default"]}</p>;
	} else if (metadata["source"].hasOwnProperty("con-Latn-EC") && metadata["source"]["con-Latn-EC"] != "") {
		source = <p>Source: {metadata["source"]["con-Latn-EC"]}</p>;
	}

	if (metadata["genre"] != "") {
		genre = <p>Genre: {metadata["genre"]}</p>;
	}

	if (metadata["date_created"] != "") {
		date_created = <p>Date: {metadata["date_created"]}</p>;
	}

	return (
		<div id="metadata">
			{description}
			{author}
			{glosser}
			{source}
		</div>
	);
}