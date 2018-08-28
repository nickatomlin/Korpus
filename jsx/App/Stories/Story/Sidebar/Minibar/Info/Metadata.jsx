export function Metadata({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: a nice display of speaker names + other metadata
	// Status: finished
	let description = null;
	let author = null;
	let genre = null;
	let date_created = null;

	if (metadata["description"] != "") {
		description = <p><b>Description:</b> {metadata["description"]}</p>;
	}

	if (metadata["author"] != "") {
		author = <p>Author: {metadata["author"]}</p>;
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
		</div>
	);
}

export function MoreMetadata({ metadata }) {
	// I/P: metadata, in JSON format
	// O/P: glosser + source information
	// Status: finished
	let glosser = null;
	let source = null;


	if (metadata["glosser"] != "") {
		glosser = <p>Glosser: {metadata["glosser"]}</p>;
	}

	if (metadata["source"]["_default"] != "") {
		source = <p>Source: {metadata["source"]["_default"]}</p>;
	} else if (metadata["source"].hasOwnProperty("con-Latn-EC") && metadata["source"]["con-Latn-EC"] != "") {
		source = <p>Source: {metadata["source"]["con-Latn-EC"]}</p>;
	}

	return (
		<div id="metadata">
			{glosser}
			{source}
		</div>
	);
}