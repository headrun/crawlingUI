import React    from "react";
import ReactDOM from "react-dom";
import IPCHelper from "../../modules/ipcHelper.js";

const validChannels = ["xpath", "css", "data"];

class Webview extends React.Component {

  constructor (props) {

    super(props);

    this.state = {

      isGuestLoading: false
    };

    this.currentUrl = props.url;
    this.currentTab = props.activeTab;

    this.__handleGuestMessages  = this.__handleGuestMessages.bind(this);
    this.__handleContentLoaded  = this.__handleContentLoaded.bind(this);
    this.__handleIPCMessage     = this.__handleIPCMessage.bind(this);
    this.__handleRedirect       = this.__handleRedirect.bind(this);
    this.__handleNavigation     = this.__handleNavigation.bind(this);
    this.__handleDevToolsClosed = this.__handleDevToolsClosed.bind(this);
    this.__handleWebviewFail    = this.__handleWebviewFail.bind(this);
  }

  __handleGuestMessages (e) {

    console.log(`Guest: ${e.sourceId} : ${e.line}\n${e.message}`);
  }

  __handleContentLoaded () {

    this.setGuestLoading(false);

    const activePaths = [];

    if (this.props.activePath) {

      activePaths.push(this.props.activePath);
    }

    this.refs.webview.send("command",
                           "startSelection",
                           activePaths);

  }

  __handleIPCMessage (e) {

    if (!e.channel || validChannels.indexOf(e.channel) < 0) {

      return;
    }

    if (e.channel === "xpath") {

      const cssPath = e.args[0];

      if (cssPath) {

        this.props.setActivePath(cssPath);
      }
    } else if (e.channel === "data") {

      this.props.setData(e.args[0] || []);
    }
  }

  __setCurrentUrl (url) {

    if (this.currentUrl === url) {

      return;
    }

    this.setGuestLoading(true);
    this.currentUrl = url;
    this.props.setUrl(url);
  }

  __handleRedirect (e) {

    return e.isMainFrame && this.__setCurrentUrl(e.newURL);
  }

  __handleNavigation (e) {

    if ("isMainFrame" in e && !e.isMainFrame) {

      return;
    }

    return this.__setCurrentUrl(e.url);
  }

  __handleDevToolsClosed () {

    this.props.hideDevTools();
  }

  __handleWebviewFail () {

    window.alert("Unable to load URL");
  }

  setGuestLoading (isLoading) {

    this.setState({

      "isGuestLoading": !!isLoading
    });
  }

  showDevTools (show) {

    return this.refs.webview[show ? "openDevTools": "claseDevTools"]();
  }

  componentWillReceiveProps(nextProps) {

    const webview = this.refs.webview,
          activePath = nextProps.activePath;

    if (nextProps.reloadUrl) {

      return webview.reload();
    }

    if (this.currentTab.id !== nextProps.activeTab.id) {

      webview.send("command", "resetAutoSelect");
      this.currentTab = nextProps.activeTab;
    }

    if (this.props.activePath !== activePath) {

      webview.send("command",
                   "deSelectAll",
                   this.props.activePath);

      if (activePath) {

        webview.send("command",
                     "select",
                     activePath);
      }
    }

    if (this.currentUrl !== nextProps.url) {

      webview.src = nextProps.url;
    }

    if (nextProps.showDevTools) {

      this.showDevTools(nextProps.showDevTools);
    }
  }

  componentDidMount () {

    const webview = this.refs.webview;

    webview.addEventListener("did-stop-loading",
                             this.__handleContentLoaded);
    webview.addEventListener("console-message",
                             this.__handleGuestMessages);
    webview.addEventListener("ipc-message",
                             this.__handleIPCMessage);
    webview.addEventListener("did-get-redirect-request",
                             this.__handleRedirect);
    webview.addEventListener("did-navigate",
                             this.__handleNavigation);
    webview.addEventListener("devtools-closed",
                             this.__handleDevToolsClosed);
    webview.addEventListener("did-fail-load",
                             this.__handleWebviewFail);

    webview.setAttribute("plugins", false);

    webview.setAttribute("preload", "./highlight.js");

    webview.setAttribute("src", this.props.url);

    this.currentUrl = this.props.url;
  }

  componentWillUnmount () {

    const webview = this.refs.webview;

    webview.removeEventListener("did-stop-loading",
                                this.__handleContentLoaded);
    webview.removeEventListener("console-message",
                                this.__handleGuestMessages);
    webview.removeEventListener("ipc-message",
                                this.__handleIPCMessage);
    webview.removeEventListener("did-get-redirect-request",
                                this.__handleRedirect);
    webview.removeEventListener("did-navigate",
                                this.__handleNavigation);
    webview.removeEventListener("devtools-closed",
                                this.__handleDevToolsClosed);
    webview.removeEventListener("did-fail-load",
                                this.__handleWebviewFail);
  }

  render () {

    return (

      <div className={"webview-content" +
                      (this.state.isGuestLoading
                       ? " guest-loading"
                       : "")
                     }>
        <webview ref="webview"></webview>
        <div className="webview-loading-indicator">
          Loading...
        </div>
      </div>
    );
  }
}

export default Webview;
