var $ = require("jquery");

$(function () {

  var router = require("./router"),
      ctrlrs = require("./controllers");

  router.addPreRoute(ctrlrs.preRoute);

  console.log("Vanakkam");

  var ROUTES = [[/^!?\/?$/, ctrlrs.home],
		[/^!?webview\/([^\/|$]+)\/?$/, ctrlrs.webview]];

  router.registerRoutes(ROUTES);

  router.initRouter();
});
