import React    from "react";
import ReactDOM from "react-dom";
import Webview from "./Webview.js";
import styles from "../less/index.less";

const modes = { "website": "w", "data"   : "d" };

class App extends React.Component {

  constructor (props) {

    super(props);

    const location = window.location.href;

    let url = location.match(/url\=([^&|$]+)/);

    url = url && decodeURIComponent((url[1] || "").trim()) || "";

    this.state = {

      "url" : url,
      "openUrl": url,
      "mode": modes.website,
      "activePath": ""
    };
  }

  setMode (mode=modes.website) {

    this.setState({mode});
  }

  setUrl (url="") {

    url = url.trim();

    this.setState({url});
  }

  setOpenUrl (openUrl="") {

    openUrl = openUrl.trim();

    this.setState({openUrl});
  }

  setActivePath (activePath="") {

    this.setState({activePath});
  }

  onKeydown (e) {

    console.log(e.keyCode);
    return e.keyCode === 13 && this.setOpenUrl(e.target.value);
  }

  render () {

    return (
      <div className={"content" + (this.state.activePath ? " has-footer" : "")}>
        <header>
          <div className="input-group">
            <span className="input-group-addon">
              <a href="../index.html">&lt; Back</a>
            </span>
            <input className="form-control"
                   type="text"
                   value={this.state.url}
                   onChange={(e) => this.setUrl(e.target.value)}
                   onKeyDown={(e) => this.onKeydown(e)}/>
          </div>
        </header>
        <div className="browser">
          <Webview url={this.state.openUrl}
                   activePath={this.state.activePath}
                   setActivePath={this.setActivePath.bind(this)}>
          </Webview>
        </div>
        <footer>
          <input className="form-control" type="text"
                 value={this.state.activePath}
                 onChange={(e) => {this.setActivePath(e.target.value)}}/>
        </footer>
      </div>
    )
  }
}

ReactDOM.render(<App/>,
                document.getElementById("react-root"));
