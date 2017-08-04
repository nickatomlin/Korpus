import React from 'react';
import id from 'shortid';
import { Link } from 'react-router-dom';

export function StoryIndex({ index }) {
    return (
        <ul>
            {
                index.map(story => (
                    <li key={id.generate()}>
                        <Link to={`/story/${story['title from filename']}`}>{story['display_title']}</Link>
                    </li>
                ))
            }
        </ul>
    );
}