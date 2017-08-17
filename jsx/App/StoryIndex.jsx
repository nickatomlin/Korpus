import React from 'react';
import id from 'shortid';
import { Link } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';

export class StoryIndex extends React.Component {
    componentDidMount() {
        const index = this.props.index;
        let storyList = [];
        for (const story in index) {
            if (index.hasOwnProperty(story)) {
                /////////////////
                // A'ingae Title
                /////////////////
                let mainTitle = '';
                // get default title
                if (index[story]['title']['_default'] != '') {
                    mainTitle = index[story]['title']['_default'];
                }
                // replace with cofan title if available
                if (index[story]['title'].hasOwnProperty('con-Latn-EC') && index[story]['title']['con-Latn-EC'] != '') {
                    mainTitle = index[story]['title']['con-Latn-EC'];
                }
                // remove first word?
                if (!isNaN(mainTitle.split(' ')[0])) {
                    mainTitle = mainTitle.substr(mainTitle.indexOf(" ") + 1);
                }
                /////////////////////
                // Translated Title
                /////////////////////
                let translatedTitle = '';
                if (index[story]['title'].hasOwnProperty('es') && index[story]['title']['es'] != '') {
                    translatedTitle = index[story]['title']['es'];
                }
                if (index[story]['title'].hasOwnProperty('en') && index[story]['title']['en'] != '') {
                    translatedTitle = index[story]['title']['en'];
                }

                let timed = '';
                if (index[story]['timed']) {
                    if (index[story]['media']['audio'] != '') {
                        timed += '🎧    '
                    }
                    if (index[story]['media']['video'] != '') {
                        timed += '🎞'
                    }
                } else {
                    timed = '✘';
                }

                // const link = ReactDOMServer.renderToString(`<Link to={'/story/${index[story]['title from filename']}'}>${mainTitle}</Link>`);
                const link = `<a href='#/story/${index[story]['title from filename']}'>${mainTitle}</a>`;

                storyList.push([link, translatedTitle, index[story]['author'], timed]);
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
                    { title: "Title (A'ingae)" },
                    { title: "Title (English)" },
                    { title: "Author" },
                    { title: "Media" }
                ]
            });
        });
        $('#indexTable').addClass("stripe");
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