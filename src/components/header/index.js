import styles from "./index.less";
import React from "react";

const themeOptions = {"dark"       : "dark",
                      "light"      : "light",
                      "transparent": "transparent"};

class Header extends React.Component {

  constructor (props) {

    super(props);

    this.state = {

      logo: {

        /* if image property is specified, it will be treated
         * as an image, specify url peoperty to make it a link
         */

        "url"  : props.url   || null,
        "text" : props.text  || "Brand",
        "image": props.image || null
      },

      tabs: [

        /* Pass elements for tabs */
      ],

      /* this will fix the navbar on top */
      isFixed: !!props.isFixed,

      theme: props.theme || themeOptions.dark
    };
  }

  render () {

    const navbarClass = (this.state.theme === "transparent" ?
                         "" : "navbar-" + theme);

    const logo  = this.state.logo,
          brand = logo.url ? (
                    <a className="navbar-brand"
                       href={logo.url}
                       tabIndex="-1">
                      { logo.image ? <img src="{logo.image}"/>
                                   : logo.text}
                    </a>) :
                    <span className="navbar-brand"
                          tabIndex="-1">
                      {logo.text}
                    </span>;

    const template = (

      <nav className={"navbar navbar-" + navbarClass}>

        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          {brand}
        </div>

        <div className="container-fluid">
          <div className="collapse navbar-collapse">
            <ul className="nav navbar-nav navbar-right">
              {this.state.tabs}
            </ul>
          </div>
        </div>

      </nav>
    );

    return template;
  }
}

export default Header;
