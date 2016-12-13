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

    this.refs.webview.send("command", "startSelection");

    console.log("Guest loaded");
  }

  __onIPCMessage () {

    console.log(`Got message from guest`);
  }

  setGuestLoading (isLoading) {

    this.setState({

      "isGuestLoading": !!isLoading
    });
  }

  componentDidMount () {

    console.log("Component mounted");

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
