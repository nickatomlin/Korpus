/*
import { createServer } from 'http';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { serverRenderText } from './bundle.js';
*/
const http = require('http');
const bundle = require('../js/bundle.js');
const serverRenderText = bundle.serverRenderText;

http.createServer((req, res) => {
    res.write(serverRenderText);
    res.end();
}).listen(8000);
