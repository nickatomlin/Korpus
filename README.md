# Korpus
A web interface for viewing annotated [ELAN](https://tla.mpi.nl/tools/tla-tools/elan/) and [FLEx](http://software.sil.org/fieldworks/) files, along with associated media data.

Contributors:
 - Nicholas Tomlin
 - Justin Bai
 - Kalinda Pride
 
 <img width="1312" alt="screen shot 2017-07-19 at 3 29 38 pm" src="https://user-images.githubusercontent.com/13228316/28385906-d16210ec-6c97-11e7-9723-f6ffcffd2377.png">
 
## Features
- Time-aligned interlinear glossing, synced with audio/video files. Similar to [ETST](http://community.village.virginia.edu/etst/).
- Auto-generated display based on ELAN/FLEx tiers. This means the software is completely independent of tier naming, language choice, etc. and does not require any special configuration.
- Ability to show/hide unwanted gloss tiers.

## Warning
**Current offline version not compatible with Chrome. See here:  https://stackoverflow.com/questions/20904098/react-js-example-in-tutorial-not-working**

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
