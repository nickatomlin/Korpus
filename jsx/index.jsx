import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
} from "react-router-dom";
import id from 'shortid';
import { Sidebar } from './Sidebar/Sidebar.jsx'
import { CenterPanel } from './Display/CenterPanel.jsx';

function StoryIndex({ storiesData }) {
	return (
		<div key={id.generate()}>
			<h2>Imagine a list of stories.</h2>
			<Link to="/story">story link</Link>
			<ul>
                {
                    storiesData.map(s => (
						<li key={id.generate()}>
							<Link to={`/story/${s['title from filename']}`}>{s['display_title']}</Link>
						</li>
                    ))
                }
			</ul>
		</div>
	);
}

function Story({ sentencesDataThisStory }) {
    const sentences = sentencesDataThisStory['sentences'];
    const timed = (sentencesDataThisStory['metadata']['timed'] === 'true');
    let footer = null;
    if (timed) {
    let audioFile;
    const media = sentencesDataThisStory['metadata']['media'];
    if ('mp3' in media) {
		audioFile = media['mp3'];
	} else {
		audioFile = media['mp4'];
	}
		footer = <audio data-live="true" controls id="audio" src={"/data/media_files/" + audioFile} />;
	}
	return (
		<div key={id.generate()}>
			<h3>a story</h3>
			<div id="middle">
				<Sidebar metadata={sentencesDataThisStory['metadata']} />
				<CenterPanel timed={timed} sentences={sentences} />
			</div>
			<div id="footer">{footer}</div>
		</div>
    );
}

function Stories({ sentencesData }) {
	console.log("Stories...");
	return (
		<div key={id.generate()}>
			<p>Stories</p>
			{
				sentencesData.map(s =>
					(<Route exact path={`/story/${s['metadata']['title from filename']}`} render={props => <Story sentencesDataThisStory={s} />} />)
				)
			}
		</div>
	);
}

function App({ data }) {
	return (
		<div key={id.generate()}>
			<p>it works! still no textsync, and need to get rid of that pesky key prop warning.</p>
			<Route exact path="/index" render={props => <StoryIndex storiesData={data.stories} />} />
			<Route path="/story" render={props => <Stories sentencesData={data.sentences} />} />
		</div>
	);
}

$.getJSON("data/fake_database.json", function(data) {
	ReactDOM.render(
		<Router>
			<App data={data} />
		</Router>,
		document.getElementById("main"),
		function() { 
			// If there is a footer, i.e., if audio exists:
			if ($("#footer").length !== 0) {
				$.ajax({
					url: "./js/txt_sync.js",
					dataType: "script"
				});

				// Resize elements based on footer height:
				var footheight = ($("#footer").height() + 48).toString() + "px";
				var bodyheight = "calc(100% - " + footheight + ")";

				$("#leftPanel").css("width", "240px");
				$("#leftPanel").css("height", bodyheight);
				$("#centerPanel").css("height", bodyheight);
			}
		}
	);
});