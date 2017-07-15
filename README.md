# Korpus
For presentation of audio/video/text corpus of Kofan texts. Previously using code from [ETST](http://community.village.virginia.edu/etst/).

Contributors:
 - Nicholas Tomlin
 - Justin Bai
 - Kalinda Pride

**WARNING: Current offline version not compatible with Chrome. See here:  https://stackoverflow.com/questions/20904098/react-js-example-in-tutorial-not-working**

To view the website in Chrome, use a SimpleHTTPServer by typing the following command from your local copy of the Korpus repository:
~~~~
npm install http-server -g
http-server -p 8000
~~~~

To compile the JSX into JS, run:
~~~~
npm install --save-dev babel-plugin-transform-react-jsx -g
babel --plugins transform-react-jsx text_display.jsx --out-file text_display.js
~~~~
