import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from './App/App.jsx';

$.getJSON('./data/fake_database.json', function(data) {
    ReactDOM.render(
        <Router>
            <App data={data} />
        </Router>,
        document.getElementById("main")
    );
});