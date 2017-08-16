import React from 'react';
import id from 'shortid';
import { Link } from 'react-router-dom';

export class StoryIndex extends React.Component {
    componentDidMount() {
        const index = this.props.index;
        let storyList = [];
        for (const story in index) {
            if (index.hasOwnProperty(story)) {
                let title = '';
                if (index[story]['title']['_default'] != '') {
                    title = index[story]['title']['_default'];
                } else if (index[story]['title'].hasOwnProperty('con-Latn-EC') && index[story]['title']['con-Latn-EC'] != '') {
                    title = index[story]['title']['con-Latn-EC'];
                }
                let timed;
                if (index[story]['timed']) {
                    timed = "✓";
                } else {
                    timed = "✗";
                }
                storyList.push([title, index[story]['author'], timed])
                // storyList.push(
                //     <li key={id.generate()}>
                //         <Link to={`/story/${index[story]['title from filename']}`}>{story}</Link>
                //     </li>
                // )
            }
        }

        $(document).ready(function() {
            $('#indexTable').DataTable( {
                data: storyList,
                columns: [
                    { title: "Name" },
                    { title: "Author" },
                    { title: "Media" }
                ]
            });
        });
    }

    render() {
        return (
            <div id="index">
                <table id="indexTable">
                </table>
            </div>
        );
    }
}