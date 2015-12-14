var $   = require("jquery"),
    URI = require("urijs");
    

var global = {};

var history = window.history;

var ROUTES = [];

var preRoute; // if assigned a function, will be called before executing
              // the controller

function initRouter () {

  function route (url) {

    // Things to be done before routing to a new URL
    if (typeof preRoute === "function") {

      preRoute();
    }

    url = window.location.href;

    var fragment = URI(url).fragment();

    var controller, curRoute, index, args;

    for (index in ROUTES) {

      curRoute = ROUTES[index];

      if (fragment.match(curRoute[0])) {

         args = curRoute[0].exec(fragment).slice(1);

         controller = curRoute[1];

         break;
      }
    }

    if (controller) {

      controller.apply(window, args);
    }
  }

  window.onpopstate = function () {

    route();
  };

  $("body").on("custom.popstate", route);

  route();
}

function registerRoute (regex, controller) {

  ROUTES.push([regex, controller]);
}

function registerRoutes (routes) {

  $.each(routes, function () {

    registerRoute.apply(null, this);
  });
}

function addPreRoute (func) {

  preRoute = func;
}

function routeTo (path) {

  var url = URI(window.location.pathname).fragment("!" + path)
                                         .href();

  if (history) {

    history.pushState("", "", url);

    $("body").trigger("custom.popstate");

    return;
  }

  window.location.href = url;
}

module.exports = {

  "initRouter": initRouter,
  "registerRoute": registerRoute,
  "registerRoutes": registerRoutes,
  "addPreRoute"   : addPreRoute,
  "routeTo": routeTo
};
