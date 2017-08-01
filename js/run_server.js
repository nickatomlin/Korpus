/*
import { createServer } from 'http';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { serverRenderText } from './bundle.js';
*/
const http = require('http');
const bundle = require('./bundle.js');
const fs = require('fs');
const indexhtml = grabIndexDotHTMLFromFileSystem;
const serverRenderText = String(bundle.serverRenderText);
const responseText = somehowInjectServerRenderTextIntoTheCorrectPartOfIndexDotHTML;

http.createServer((req, res) => {
    res.write(responseText);
    res.end();
}).listen(8000);
