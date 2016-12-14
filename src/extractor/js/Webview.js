import React    from "react";
import ReactDOM from "react-dom";

class Webview extends React.Component {

  constructor (props) {

    super(props);

    this.state = {

      isGuestLoading: true
    };

    this.__logGuestMessages = this.__logGuestMessages.bind(this);
    this.__handleContentLoaded = this.__handleContentLoaded.bind(this);
    this.__onIPCMessage = this.__onIPCMessage.bind(this);
  }

  __logGuestMessages (e) {

    console.log(`Guest: ${e.message}`);
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

    console.log("Guest loaded");
  }

  __onIPCMessage (e) {

    if (!e.channel || e.channel !== "cssPath") {

      return;
    }

    var cssPath = e.args[0];

    if (cssPath) {

      this.props.setActivePath(cssPath);
    }
  }

  setGuestLoading (isLoading) {

    this.setState({

      "isGuestLoading": !!isLoading
    });
  }

  componentWillReceiveProps(nextProps) {

    const activePath = nextProps.activePath;

    if (this.props.activePath === activePath)
      return;

    this.refs.webview.send("command",
                           "deSelectAll",
                           this.props.activePath);

    if (activePath) {

      this.refs.webview.send("command",
                             "select",
                             activePath);
    }
  }

  componentDidMount () {

    console.log("Mounted");

    const webview = this.refs.webview;

    this.setGuestLoading(true);

    webview.addEventListener("did-stop-loading",
                             this.__handleContentLoaded);
    webview.addEventListener("console-message",
                             this.__logGuestMessages);
    webview.addEventListener("ipc-message",
                             this.__onIPCMessage);

    webview.setAttribute("plugins", false);

    webview.setAttribute("preload", "./highlight.js");

    webview.setAttribute("src", this.props.url);
  }

  componentWillUnmount () {

    const webview = this.refs.webview;

    webview.removeEventListener("did-stop-loading",
                                this.__handleContentLoaded);
    webview.removeEventListener("console-message",
                                this.__logGuestMessages);
    webview.removeEventListener("ipc-message",
                                this.__onIPCMessage);
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
