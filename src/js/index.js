import React    from "react";
import ReactDOM from "react-dom";
import style    from "../less/index.less";
import Header from "../components/header/index.js";

const urlRegex = /https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)/;

class App extends React.Component {

  constructor (props) {

    super(props);

		this.state = {

			"urlsValue"   : "https://pamidi.me",
      "isValidInput": true
		};
	}

  handleChange (e) {

		this.setState({"urlsValue": e.target.value.trim()});
	}

	handleSubmit (e) {

    e.preventDefault();

    const value     = this.state.urlsValue,
          validUrls = [];

    let isValidInput = false,
        urlsValue = [];

    if (value.length > 0) {

      isValidInput = true;

      value.split(",").forEach(function (url) {

        url = url.trim();

        urlsValue.push(url);

        if (isValidInput && !url.match(urlRegex)) {

          isValidInput = false;
          return;
        }
      });
    }

    urlsValue = urlsValue.join(",");

    this.setState({ urlsValue, isValidInput });

    if (isValidInput) {

      window.location = `./extractor/index.html?url=${urlsValue}`;
    }
	}

  render () {

		return (

	    <div className="app">
				<Header theme="transparent"
					      text="Crawling UI"
								url="index.html"/>
	      <div className="content">
	  		  <div className="container-fluid">
	  			  <form onSubmit={(e) => this.handleSubmit(e)}>
							<div className={"form-group " +
                              (!this.state.isValidInput ? "has-error" : "")
                             }>
								<label>URL</label>
								<input type="text"
                       className="form-control"
									     onChange={(e) => this.handleChange(e)}
									     value={this.state.urlsValue}
											 placeholder="Enter a URL to crawl" />
                <p className={"help-block text-danger " +
                              (this.state.isValidInput ? "hide" : "")
                             }>Please Enter a valid URL</p>
							</div>
              <button type="submit"
                      className="btn btn-default">Submit</button>
	  			  </form>
	  			</div>
	      </div>
			</div>
		);
	}
}

ReactDOM.render(
  <App/>,
  document.getElementById("react-root")
);
