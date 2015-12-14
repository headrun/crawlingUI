var $ = require("jquery");

$(function () {

  var router = require("./js/router"),
      ctrlrs = require("./js/controllers");

  router.addPreRoute(ctrlrs.preRoute);

  var ROUTES = [[/^!?\/?$/, ctrlrs.home],
		[/^!?webview\/([^\/|$]+)\/?$/, ctrlrs.webview]];

  router.registerRoutes(ROUTES);

  router.initRouter();
});
