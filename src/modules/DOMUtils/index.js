var selectors = require("./selectors.js"),
    optimise  = require("./optimise.js");

module.exports = {

  getElementCSSSelector: selectors.getElementCSSSelector,
  getCommonCSSSelector : selectors.getCommonCSSSelector,
  getCSSSelector       : selectors.getCSSSelector,
  optimise             : optimise.optimise
};
