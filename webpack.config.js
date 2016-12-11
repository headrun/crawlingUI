var HtmlWebpackPlugin = require("html-webpack-plugin"),
    webpack = require('webpack');

module.exports = {

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
              })
       ]
}
