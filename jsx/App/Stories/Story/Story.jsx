import { Sidebar } from './Sidebar/Sidebar.jsx';
import { CenterPanel } from './Display/CenterPanel.jsx';
import { Video } from './Sidebar/Video.jsx';

export class Story extends React.Component {
    componentDidMount() {
        // If there is a footer, i.e., if audio exists:
        if ($('#footer').length !== 0) {
            $.ajax({
                url: 'js/txt_sync.js',
                dataType: 'script',
            });
        }
        // If video exists:
        if ($('#video').length !== 0) {
            Video.show();
        } else {
            Video.hide();
        }
    }

    render() {
        const story = this.props.story;
        console.log(story);
        const sentences = story['sentences'];
        const timed = (story['metadata']['timed']);
        let footer = null;
        if (timed) {
            let audioFile; // determines if audio should be pulled from mp3 or mp4
            const media = story['metadata']['media'];
            if (media.hasOwnProperty('audio') && media['audio'] != '') {
                audioFile = media['audio'];
            } else {
                audioFile = media['video'];
            }
            // determines if audioPlayer should sync on load
            footer = <div id="footer"><audio data-live="false" controls id="audio" src={'data/media_files/' + audioFile}/></div>;
        }
        return (
            <div>
                <div id="middle">
                    <Sidebar metadata={story['metadata']}/>
                    <CenterPanel timed={timed} sentences={sentences}/>
                </div>
                {footer}
            </div>
        );
    }
}