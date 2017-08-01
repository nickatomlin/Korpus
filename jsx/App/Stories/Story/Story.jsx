import React from 'react';
import { Sidebar } from './Sidebar/Sidebar.jsx';
import { CenterPanel } from './Display/CenterPanel.jsx';

export class Story extends React.Component {
    componentDidMount() {
        // If there is a footer, i.e., if audio exists:
        if ($('#footer').length !== 0) {
            $.ajax({
                url: '/Korpus/js/txt_sync.js',
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
            footer = <audio data-live="true" controls id="audio" src={'/Korpus/data/media_files/' + audioFile}/>;
        }
        return (
            <div>
                <div id="middle">
                    <Sidebar metadata={story['metadata']}/>
                    <CenterPanel timed={timed} sentences={sentences}/>
                </div>
                <div id="footer">{footer}</div>
            </div>
        );
    }
}