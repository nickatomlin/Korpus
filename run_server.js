import { createServer } from 'http';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Server } from './jsx/server.jsx';

createServer((req, res) => {
    const html = ReactDOMServer.renderToString(<Server />);
    res.write(html);
    res.end();
}).listen(8000);
