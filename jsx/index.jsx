class DocLink extends React.Component {
  // I/P: fileName, the filename (including file extension, excluding file path) of the document
  // O/P: a button to view that document
  // Status: tested, working
  render () {
    var fileName = this.props.fileName;
    var encodedFileName = encodeURI(fileName);
    return <li><a className="docLink" href={"#/story/" + encodedFileName} data-button_text={fileName}>{fileName}</a></li>;
  }
}

class IndexDisplay extends React.Component {
  // I/P: index, a list of the JSON index metadata for each document
  // O/P: a list of buttons, one to view each document
  // Status: tested, working
  render () {
    var files = this.props.data;
    var output = [];
    for (var i=0; i<files.length; i++) {
      var fileName = files[i]["title from filename"];
      output.push(<DocLink key={i} fileName={fileName}/>);
    }
    return <div style={{margin: "20px"}}>List of stories: <ul className="indexDisplay">{output}</ul></div>;
  }
}

function showIndex() {
  $.getJSON("./data/index.json", function(data) {
    ReactDOM.render(
      <IndexDisplay data={data} />,
      document.getElementById('centerPanel')
    );
    ReactDOM.render(
      <span></span>,
      document.getElementById('leftPanel')
    )
    $(".docLink").click(function() {
      displayText($(this).data('button_text'));
    });
  });
}