var path = require("path"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    webpack = require('webpack'),
    webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

var options = {

  "target": "electron",
	"entry" : {"index"    : "./src/js/index.js",
             "extractor/index": "./src/extractor/js/index.js"},
	"output": {

		"path"      : "./build",
    "publicPath": "/",
		"filename"  : "[name].js"
	},
  "module": {

          "loaders": [

                 {
          		"test"   : /\.jsx?$/,
          		"loader" : "babel-loader",
              "include": [

                path.resolve(__dirname, "src")
              ],
          		"query"  : {

          	             "presets": ["es2015", "react"]
          		}
          	},
                 {
                        "test"  : /\.html$/,
                        "loader": "html"
                 },
          	{

          		"test"  : /\.(less|css)$/,
          		"loader": "style-loader!css-loader!less-loader"
          	},
          	{
          		"test"  : /\.(png|jpg|eot|woff2|woff|ttf|svg)$/,
          		"loader": "url-loader?limit=8192"
          	}
          ]
       },
       "plugins": [

              new HtmlWebpackPlugin({

                     "template": "./src/index.html",
                     "inject"  : false
              }),
              new HtmlWebpackPlugin({

                     "template": "./src/extractor/index.html",
                     "inject"  : false,
                     "filename": "extractor/index.html"
              }),
              new webpack.optimize.CommonsChunkPlugin({

                name: 'common'
              }),
              new CopyWebpackPlugin([

                {"from": "./src/extractor/js/highlight.js",
                 "to"  : "extractor/highlight.js"},
                {"from": "./src/modules/xpathUtils.js",
                 "to"  : "extractor/xpathUtils.js"}
              ])
       ]
};

options.target = webpackTargetElectronRenderer(options);

module.exports = options;
