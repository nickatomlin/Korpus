const http = require('http');
const bundle = require('./bundle.js');
const fs = require('fs');
const ReactDOMServer = require('react-dom/server');
const serverRenderText = bundle.serverRenderText();

const indexPt1 = fs.readFileSync('./Korpus/index_part1.html', 'utf8');
const indexPt2 = fs.readFileSync('./Korpus/index_part2.html', 'utf8');

http.createServer((req, res) => {
    res.write(indexPt1);
    res.write(serverRenderText);
    res.write(indexPt2);
    res.end();
}).listen(8000);


