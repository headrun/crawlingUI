import React    from "react";
import ReactDOM from "react-dom";
import styles from "../less/index.less";

const modes = {

  "website": "w",
  "data"   : "d"
};

class App extends React.Component {

  constructor (props) {

    super(props);

    const location = window.location.href;

    this.state = {

      "url" : (location.match(/url\=([^&|$]+)/)[1] || "").trim(),
      "mode": modes.website,
      "activePath": ""
    };
  }

  setMode (mode=modes.website) {

    this.setState({mode});
  }

  setActivePath (activePath="") {

    this.setState({activePath});
  }

  render () {

    return (
      <div className={"content" + (this.state.activePath ? " has-footer" : "")}>
        <header>
          <div className="input-group">
            <span className="input-group-addon">
              <a href="../index.html">&lt; Back</a>
            </span>
            <input className="form-control" type="text"
                   disabled="disabled" value={this.state.url}/>
          </div>
        </header>
        <div className="browser"></div>
        <footer>
          <input className="form-control" type="text"
                 value={this.state.activePath}
                 onChange={this.setActivePath.bind(this)}/>
        </footer>
      </div>
    )
  }
}

ReactDOM.render(<App/>,
                document.getElementById("react-root"));