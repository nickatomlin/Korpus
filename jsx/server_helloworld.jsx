import { createServer } from 'http';

server.get('/', (request, response) => {
    const html = ReactDOMServer.renderToString(<Server />);
    response.send(html);
});

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
});
