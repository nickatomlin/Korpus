import React from 'react';
import id from 'shortid';
import { Link } from 'react-router-dom';

export function StoryIndex({ index }) {
    let storyList = [];
    for (const story in index) {
        if (index.hasOwnProperty(story)) {
            storyList.push(
                <li key={id.generate()}>
                    <Link to={`/story/${index[story]['title from filename']}`}>{story}</Link>
                </li>
            )
        }
    }
    return <ul>{storyList}</ul>;
}