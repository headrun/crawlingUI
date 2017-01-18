var siblings  = require("./siblings.js"),
    selectors = require("./selectors.js"),
    match     = require("./match.js"),
    optimise  = require("./optimise.js");

module.exports = {

  getElementCSSSelector: selectors.getElementCSSSelector,
  getCommonCSSSelector : selectors.getCommonCSSSelector,
  optimise             : optimise.optimiseCSSPath
};
