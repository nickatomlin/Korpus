const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

class BasicExample extends React.Component {
  render() {
    console.log("rendering BasicExample");
    return <div><ul><li>Home</li></ul></div>
  }
}


ReactDOM.render(
  <BasicExample/>,
  document.getElementById('centerPanel')
);