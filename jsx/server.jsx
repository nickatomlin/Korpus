import React from 'react';
import { StaticRouter } from 'react-router';
import { App } from './App/App.jsx';

export function Server() {
    $.getJSON('./data/fake_database.json', function(data) {
        return (
            <StaticRouter location={req.url}>
                <App data={data}/>
            </StaticRouter>
        );
    });
}
