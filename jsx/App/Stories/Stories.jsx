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
                    exact path={`/story/${story['metadata']['story ID']}`}
                    render={props => <Story story={story} />}
                />
              </div>
          ))
        }
      </div>
  );
}