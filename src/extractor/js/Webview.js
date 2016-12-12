import React    from "react";
import ReactDOM from "react-dom";

class Webview extends React.Component {

  constructor (props) {

    super(props);

    this.state = {

      src: props.url
    };
  }

  render () {

    return (

      <webview src={this.state.src}
               pre-load="./highlight.js"></webview>
    );
  }
}
