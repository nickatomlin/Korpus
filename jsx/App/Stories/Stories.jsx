import React from 'react';
import id from 'shortid';
import { Route, Switch } from 'react-router-dom';
import { Story } from './Story/Story.jsx';
import { NotFound } from './NotFound.jsx';

export function Stories({ stories }) {
  return (
      <Switch>
        {
          stories.map(story => (
              <Route
									key={id.generate()}
									exact path={`/story/${story['metadata']['story ID']}`}
									render={props => <Story story={story} />}
							/>
          ))
        }
				<Route component={NotFound} />
      </Switch>
  );
}