# Korpus
For presentation of audio/video/text corpus of Kofan texts. Borrowing code from [ETST](http://community.village.virginia.edu/etst/).

Contributors:
 - Nicholas Tomlin
 - Justin Bai
 - Kalinda Pride

**WARNING: Current version not compatible with Chrome. See here:  https://stackoverflow.com/questions/20904098/react-js-example-in-tutorial-not-working**

To view the website in Chrome, use a SimpleHTTPServer as follows:
~~~~
python -m SimpleHTTPServer
~~~~
and open [localhost:8000](localhost:8000) in your browser to view the site.

We're considering re-writing the codebase from PHP into ReactJS. This branch will store tests in React JS and eventually become the main codebase if we decide to make the switch.

For now, I'm storing data in-line in the `react.jsx` file. We'll need to move it to couchDB or something similar later.
