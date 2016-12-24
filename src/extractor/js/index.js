const fs = require("fs"),
      path = require("path");
      
import config from "../../../config.js";
import React    from "react";
import ReactDOM from "react-dom";
import Webview from "./Webview.js";
import styles from "../less/index.less";
import codeIcon from "../../images/code.svg";
import globe from "../../images/globe.svg";
import download from "../../images/download.svg";

const modes = { "website": "w", "data"   : "d" };

const newTabData = {"name": "New Column", "selector": ""};

const saveDir = config.crawlersSavePath;

class App extends React.Component {

  constructor (props) {

    super(props);

    const location = window.location.href;

    let url = location.match(/url\=([^&|$]+)/);

    url = url && decodeURIComponent((url[1] || "").trim()) || "";

    const tabs = [Object.assign({}, newTabData)];

    this.state = {

      "url"           : url || "https://pamidi.me",
      "openUrl"       : url,
      "mode"          : modes.website,
      "activePath"    : "",
      "isDevToolsOpen": false,
      "activeTabIndex": 0,
      "tabs"          : tabs /* [{"name": "tabname", "selector": ".//div"}] */,
      "data"          : [],
      "reloadUrl"     : false
    };

    this.tabElements = {}; //Tab elements dom refereces
    this.toggleDevTools = this.toggleDevTools.bind(this);
    this.handleNewTab = this.handleNewTab.bind(this);
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

    const tabs = this.state.tabs;

    tabs[this.state.activeTabIndex].selector = activePath;

    this.setState({activePath, tabs});
  }

  setActiveTab (activeTabIndex=0) {

    const toBeActiveTab = this.state.tabs[activeTabIndex],
          activePath    = toBeActiveTab.selector;

    this.setState({activeTabIndex, activePath});
  }

  setTabName (tab, name, index) {

    tab.name = name;
    this.setState({"tabs": this.state.tabs}, () => {

      const input = this.tabElements[index].children[1];
      input.value = "";
      input.focus();
    });
  }

  saveConfig () {

    const data = {"startUrls": [this.state.openUrl],
                  "xpths": []};

    data.xpaths = this.state.tabs.map((tab) => {

                    return {"name": tab.name, "xpath": tab.selector};
                  });


  }

  handleNewTab (e) {

    e.preventDefault();

    const tabs = this.state.tabs,
          newTabIndex = tabs.length;

    tabs.push(Object.assign({}, newTabData));

    this.setState({tabs}, () => {

      this.setActiveTab(newTabIndex);
      this.tabElements[newTabIndex].focus();
    });
  }

  onKeydown (e) {

    if (e.keyCode !== 13)
      return

    if (this.state.openUrl === e.target.value) {

      //reload webview
      return this.setState({reloadUrl: true},
                            () => this.setState({reloadUrl: false}));
    }

    this.setState({

      activePath: "",
      activeTabIndex: 0,
      tabs: [Object.assign({}, newTabData)],
      openUrl: e.target.value
    });
  }

  toggleDevTools (e) {

    this.setState({

      "isDevToolsOpen": !this.state.isDevToolsOpen
    });
  }

  render () {

    function getTabName (e, tabname) {

      if (e.keyCode === 8) {

        return tabname.substr(0, tabname.length - 1);
      }

      return tabname + e.target.value;
    }

    function getTab (tab, index) {

      return (

        <li key={tab.name + index}
            className={index === this.state.activeTabIndex ? "active" : ""}>
          <a href="#"
             ref={(element) => { this.tabElements[index] = element; }}
             onClick={(e) => {e.preventDefault();this.setActiveTab(index);}}>
            <span onClick={(e) => e.target.nextSibling.focus()}>
              {tab.name}
            </span>
            <input type="text"
                   className="cursor"
                   onKeyUp={(e) => {
                     this.setTabName(tab, getTabName(e, tab.name), index)
                   }}/>
          </a>
        </li>
      );
    }

    const tabsList = this.state.tabs.map(getTab.bind(this));

    let dataCounter = 0;

    function getDataItem (text) {

      return <li key={dataCounter++} className="list-group-item">{text}</li>
    }

    const dataList = this.state.data.map(getDataItem);

    if (dataList.length === 0) {

      //put dummy rows
      Array(10).forEach(() => dataList.push(getDataItem("")));
    }

    return (
      <div className={"content"
                      + (this.state.activePath ? " has-footer" : "")
                      + (this.state.isDevToolsOpen ? " has-dev-tools" : "")
                     }>
        <header>
          <div className="input-group">
            <span className="input-group-addon">
              <img src={globe} />
            </span>
            <input className="form-control"
                   type="text"
                   value={this.state.url}
                   onChange={(e) => this.setUrl(e.target.value)}
                   onKeyDown={(e) => this.onKeydown(e)}/>
            <span className="input-group-addon">
              <img src={download} />
            </span>
          </div>
        </header>
        <div className="content-body">
          <ul className="nav nav-tabs">
            {tabsList}
            <li>
              <a href="#"
                 onClick={this.handleNewTab}>+</a>
            </li>
          </ul>
          <div className="browser">
            <Webview url={this.state.openUrl}
                     activePath={this.state.activePath}
                     setActivePath={this.setActivePath.bind(this)}
                     setUrl={(url) => this.setState({url, "openUrl": url})}
                     showDevTools={this.state.isDevToolsOpen}
                     setData={(data) => this.setState({data})}
                     reloadUrl={this.state.reloadUrl}
                     hideDevTools={() => {this.setState({isDevToolsOpen: false})}}>
            </Webview>
          </div>
        </div>
        <footer>
          <div className="footer-content">
            <div className="input-group">
              <div className="input-group-addon"
                   onClick={this.toggleDevTools}>
                <img src={codeIcon} />
              </div>
              <input className="form-control" type="text"
                     value={this.state.activePath}
                     onChange={(e) => {this.setActivePath(e.target.value)}}/>
            </div>
            <div className="sample-data">
              <p><b>Sample Data:</b> ({this.state.data.length + " Records"})</p>
              <ul className="list-group">
                {dataList}
              </ul>
            </div>
          </div>
        </footer>
      </div>
    )
  }
}

ReactDOM.render(<App/>,
                document.getElementById("react-root"));
