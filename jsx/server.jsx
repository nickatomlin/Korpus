import React from 'react';
import { StaticRouter } from 'react-router';
import ReactDOMServer from 'react-dom/server';
import { App } from './App/App.jsx';

const data =
    {
        "index":
            [{
                "title from filename": "TruncatedIntro",
                "display_title": "Ingi Cansecho Ande (La tierra que vivimos) truncated"
            }],
        "stories":
            [{
                "metadata": {
                    "title from filename": "Intro",
                    "tier IDs": {
                        "T1": "A'ingae",
                        "T2": "English",
                        "T3": "Morphemes",
                        "T4": "Glossed Morpheme"
                    },
                    "speaker IDs": {
                        "S1": {
                            "name": "Martin Criollo",
                            "tier": "T1"
                        }
                    },
                    "title": "Intro",
                    "timed": "true",
                    "media": {
                        "mp3": "Intro.mp3",
                        "mp4": "Intro.mp4"
                    }
                },
                "sentences":
                    [{
                        "speaker": "S1",
                        "tier": "T1",
                        "start_time_ms": 43536,
                        "end_time_ms": 45004,
                        "num_slots": 1,
                        "text": "<- Singing",
                        "dependents": []
                    }]
            }]
    };

function Server() {
    //$.getJSON('./data/fake_database.json', function(data) {
        return (
            <StaticRouter location="/Korpus/index" context={{}}>
                <App data={data}/>
            </StaticRouter>
        );
    //});
}
// StaticRouter location={req.url}
//export const serverRenderText = ReactDOMServer.renderToString(<Server />);
export function serverRenderText() {
    return ReactDOMServer.renderToString(<Server />);
}