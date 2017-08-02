const http = require('http');
const bundle = require('./bundle.js');
const fs = require('fs');
const ReactDOMServer = require('react-dom/server');
const serverRenderText = bundle.serverRenderText();

const indexPt1 = fs.readFileSync('index_part1.html', 'utf8');
const indexPt2 = fs.readFileSync('index_part2.html', 'utf8');
const css = fs.readFileSync('css/main.css', 'utf8');

http.createServer((req, res) => {
	if (req.url === '/' || req.url === '/js/bundle.js') {
		res.writeHead(200, {"Content-Type": "text/html"});
    	res.write(indexPt1);
    	res.write(serverRenderText);
		res.write(indexPt2);
    	res.end();
	} else if (req.url === '/css/main.css?version=0.2.5') {
		res.writeHead(200, {'Content-type' : 'text/css'});
		res.write(css);
		res.end();
	}
	else {
		console.log(req.url);
	}
}).listen(8000);


