import React from 'react';
import { StaticRouter } from 'react-router';
import ReactDOMServer from 'react-dom/server';
import { App } from './App/App.jsx';

const data = {"index":[], "stories":[]};

function Server() {
    //$.getJSON('./data/fake_database.json', function(data) {
        return (
            <StaticRouter context={{}}>
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