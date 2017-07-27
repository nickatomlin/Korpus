import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link
} from "react-router-dom";
import id from 'shortid';
import { Sidebar } from './Sidebar/Sidebar.jsx'
import { CenterPanel } from './Display/CenterPanel.jsx';

function StoryIndex({ index }) {
	return (
		<div key={id.generate()}>
			<h2>Imagine a list of stories.</h2>
			<Link to="/story">story link</Link>
			<ul>
                {
                    index.map(story => (
						<li key={id.generate()}>
							<Link to={`/story/${story['title from filename']}`}>{story['display_title']}</Link>
						</li>
                    ))
                }
			</ul>
		</div>
	);
}

class Story extends React.Component {
    componentDidMount() {
        // If there is a footer, i.e., if audio exists:
        if ($('#footer').length !== 0) {
            $.ajax({
                url: '/js/txt_sync.js',
                dataType: 'script',
            });

            // Resize elements based on footer height:
            var footheight = ($('#footer').height() + 48).toString() + 'px';
            var bodyheight = 'calc(100% - ' + footheight + ')';

            $('#leftPanel').css('width', '240px');
            $('#leftPanel').css('height', bodyheight);
            $('#centerPanel').css('height', bodyheight);
        }
    }

    render() {
        const story = this.props.story;
        const sentences = story['sentences'];
        const timed = (story['metadata']['timed'] === 'true');
        let footer = null;
        if (timed) {
            let audioFile;
            const media = story['metadata']['media'];
            if ('mp3' in media) {
                audioFile = media['mp3'];
            } else {
                audioFile = media['mp4'];
            }
            footer = <audio data-live="true" controls id="audio" src={'/data/media_files/' + audioFile}/>;
        }
        return (
            <div key={id.generate()}>
                <h3>a story</h3>
                <div id="middle">
                    <Sidebar metadata={story['metadata']}/>
                    <CenterPanel timed={timed} sentences={sentences}/>
                </div>
                <div id="footer">{footer}</div>
            </div>
        );
    }
}

function Stories({ stories }) {
	return (
		<div key={id.generate()}>
			<p>Stories</p>
			{
				stories.map(story => (
					<Route
                        exact path={`/story/${story['metadata']['title from filename']}`}
                        render={props => <Story story={story} />}
                    />
                ))
			}
		</div>
	);
}

function App({ data }) {
	return (
		<div key={id.generate()}>
			<p>Need to get rid of that pesky key prop warning. Also "show video" exists even on singo a'i and clicking certain minibar icons makes the video so big that the minibar is inaccessible.</p>
			<Route exact path="/index" render={props => <StoryIndex index={data.index} />} />
			<Route path="/story" render={props => <Stories stories={data.stories} />} />
		</div>
	);
}

$.getJSON("data/fake_database.json", function(data) {
	ReactDOM.render(
		<Router>
			<App data={data} />
		</Router>,
		document.getElementById("main")
	);
});