# Korpus
For presentation of audio/video/text corpus of Kofan texts. Borrowing code from [ETST](http://community.village.virginia.edu/etst/).

Contributors:
 - Nicholas Tomlin
 - Justin Bai
 - Kalinda Pride

**WARNING: Current offline version not compatible with Chrome. See here:  https://stackoverflow.com/questions/20904098/react-js-example-in-tutorial-not-working**

To view the website in Chrome, use a SimpleHTTPServer by typing the following command from your local copy of the Korpus repository:
~~~~
python -m SimpleHTTPServer
~~~~
and open [localhost:8000](http://localhost:8000) in your browser to view the site. If the above command doesn't work, try 
~~~
python -m http.server
~~~
(Windows 10 and/or Python 3 uses that module name instead). 

We're considering re-writing the codebase from PHP into ReactJS. This branch will store tests in React JS and eventually become the main codebase if we decide to make the switch.

For now, I'm storing data in-line in the `react.jsx` file. We'll need to move it to couchDB or something similar later.
