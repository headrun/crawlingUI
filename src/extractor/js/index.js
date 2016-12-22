import React    from "react";
import ReactDOM from "react-dom";
import Webview from "./Webview.js";
import styles from "../less/index.less";
import codeIcon from "../../images/code.svg";

const modes = { "website": "w", "data"   : "d" };

class App extends React.Component {

  constructor (props) {

    super(props);

    const location = window.location.href;

    let url = location.match(/url\=([^&|$]+)/);

    url = url && decodeURIComponent((url[1] || "").trim()) || "";

    this.state = {

      "url" : url || "https://pamidi.me",
      "openUrl": url,
      "mode": modes.website,
      "activePath": "",
      "isDevToolsOpen": false
    };

    this.toggleDevTools = this.toggleDevTools.bind(this);
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

  toggleDevTools (e) {

    this.setState({

      "isDevToolsOpen": !this.state.isDevToolsOpen
    });
  }

  render () {

    return (
      <div className={"content"
                      + (this.state.activePath ? " has-footer" : "")
                      + (this.state.isDevToolsOpen ? " has-dev-tools" : "")
                     }>
        <header>
          <div className="input-group">
            <span className="input-group-addon toggle-dev-tools"
                  onClick={this.toggleDevTools}>
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
                   setActivePath={this.setActivePath.bind(this)}
                   setUrl={(url) => this.setState({url, "openUrl": url})}
                   showDevTools={this.state.isDevToolsOpen}>
          </Webview>
        </div>
        <footer>
          <div className="input-group">
            <div className="input-group-addon"
                 onClick={this.toggleDevTools}>
              <img src={codeIcon} />
            </div>
            <input className="form-control" type="text"
                   value={this.state.activePath}
                   onChange={(e) => {this.setActivePath(e.target.value)}}/>
          </div>
        </footer>
      </div>
    )
  }
}

ReactDOM.render(<App/>,
                document.getElementById("react-root"));
