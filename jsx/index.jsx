class DocLink extends React.Component {
  // I/P: fileName, the filename (including file extension, excluding file path) of the document
  // O/P: a button to view that document
  // Status: untested
  render () {
    var fileName = this.props.fileName;
    var buttonText = fileName.substring(0, -4); // remove the .json extension
    var clickHandler = "displayText('" + buttonText + "')";
    return <li><button style="margin-left: 250px;" onClick={clickHandler}>{buttonText}</button></li>;
  }
}

class IndexDisplay extends React.Component {
  // I/P: index, a list of the JSON index metadata for each document
  // O/P: a list of buttons, one to view each document
  // Status: untested
  render () {
    var files = this.props.data;
    var output = [];
    for (var i=0; i<files.length; i++) {
      var fileName = files[i]["title from filename"];
      output.push(<DocLink key={i} fileName={fileName}/>);
    }
    return <ul className="indexDisplay">{output}</ul>;
  }
}
$.getJSON("./data/json_files/index.json", function(data) {
  ReactDOM.render(
    <IndexDisplay data={data} />,
    document.getElementById('centerPanel')
  );
});
 