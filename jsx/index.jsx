var fs = require('fs');

class DocLink extends React.Component {
  // I/P: fileName, the filename (including file extension, excluding file path) of the document
  // O/P: a button to view that document
  // Status: untested
  render () {
    var fileName = this.props.fileName;
    var buttonText = fileName.substring(0, -4); // remove the .json extension
    var clickHandler = "displayText('" + buttonText + "')";
    return <li><button style="margin-left: 250px;" onclick={clickHandler}>{buttonText}</button></li>;
  }
}

class IndexDisplay extends React.Component {
  // I/P: none
  // O/P: a list of buttons, one to view each document
  // Status: untested
  render () {
    var path = "./data/json_files";
    fs.readdir(path, function(err, fileNames) {
      if (err) throw err;
      
      var output = [];
      for (var i=0; i<fileNames.length; i++) {
          output.push(<DocLink key={i} fileName={fileNames[i]}/>);
      }
    });
    return <ul className="indexDisplay">{output}</ul>;
  }
}

$ReactDOM.render(
  <IndexDisplay/>,
  document.getElementById('centerPanel')
);
 