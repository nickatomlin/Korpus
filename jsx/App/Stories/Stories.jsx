import React from 'react';
import id from 'shortid';
import { Route } from 'react-router-dom';
import { Story } from './Story/Story.jsx';

export function Stories({ stories }) {
    return (
        <div>
            {
                stories.map(story => (
                    <div key={id.generate()}>
                        <Route
                            exact path={`/Korpus/story/${story['metadata']['title from filename']}`}
                            render={props => <Story story={story} />}
                        />
                    </div>
                ))
            }
        </div>
    );
}