import React    from "react";
import ReactDOM from "react-dom";
import style    from "../less/index.less";
import Header from "../components/header/index.js";

function App (props) {

	return (

    <div className="app">
			<Header theme="transparent"
				      text="Crawling UI"
							url="index.html"/>
      <div className="content">
  		  <div className="container-fluid">
  			  <h1>Hello World!</h1>
  			</div>
      </div>
		</div>
	);
}

ReactDOM.render(
  <App/>,
  document.getElementById("react-root")
);
