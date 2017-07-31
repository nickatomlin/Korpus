// from https://stackoverflow.com/questions/36636409/server-side-rendering-with-react-router
import http from 'http'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Route, match, RouterContext } from 'react-router'
import fs from 'fs'


class Home extends React.Component{
    render(){
        return <div>{this.props.children}</div>
    }
}

class Hello extends React.Component{
    render(){
        return <h1>Hello World</h1>
    }
}

const routes = (
    <Route path="/" component={Home}>
        <Route path="hello" component={Hello} />
    </Route>
)

http.createServer((req, res) => {

    match({ routes, location: req.url }, (err, redirect, props) => {
        if (props){
            let markup = renderToString(<RouterContext {...props}/>)
            res.write(markup)
            res.end()
        } else {
            res.write("not found")
            res.end()
        }

    })
}).listen(8888);