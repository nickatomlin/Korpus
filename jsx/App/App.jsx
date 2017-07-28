import React from 'react';
import id from 'shortid';
import { Route } from 'react-router-dom';
import { StoryIndex } from './StoryIndex.jsx';
import { Stories } from './Stories/Stories.jsx';

export function App({ data }) {
    return (
        <div>
            <Route exact path="/Korpus/index" render={props => <StoryIndex index={data.index} />} />
            <Route path="/Korpus/story" render={props => <Stories stories={data.stories} />} />
        </div>
    );
}