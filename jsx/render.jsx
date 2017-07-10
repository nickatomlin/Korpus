// Import not currently working.

import {Row, Sentence, LabeledSentence, LabeledTimeBlock, TextDisplay} from "text_display.jsx";

$.getJSON( "./data/json_files/Intro.json", function(data) {
  ReactDOM.render(
  <TextDisplay data={data}/>,
  document.getElementById('centerPanel')
);
})