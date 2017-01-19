"use strict";

var _                      = require("underscore"),
    getMatch               = require("./match.js").getMatch,
    getBestMatch           = require("./match.js").getBestMatch,
    getAttributesSelectors = require("./selectors").getAttributesSelectors,
    getClassSelectors      = require("./selectors").getClassSelectors,
    document               = window.document;

function optimise (currentElements, optimisedPath, fullPath, prevSelector, prevElements) {

  if (fullPath.length === 0 || currentElements.length === 0) {

    return;
  }

  var areLeafNodes = optimisedPath.length === 0;

  var fullPathArray = fullPath.split(" > ");

  var positionSelector = fullPathArray.pop(),
      position = (positionSelector.match(/\((\d+)\)/) || [])[1],
      nodeNameSelector = positionSelector.match(/^[^\:$]+/)[0];

  fullPath = fullPathArray.join(" > ");

  var currentMatchPriority = {};

  currentMatchPriority[nodeNameSelector] = 1;

  var selector = nodeNameSelector,
      selectors = [],
      attributesSelector = getBestMatch(nodeNameSelector, currentElements,
                                        getAttributesSelectors);

  if (attributesSelector) {

    selectors.push(attributesSelector.selector);
  }

  var classSelector = getBestMatch(nodeNameSelector, currentElements,
                                   getClassSelectors);

  if (classSelector) {

    selectors.push(classSelector.selector);
  }

  selectors.push(nodeNameSelector);

  if (position) {

    if (attributesSelector) {

      selectors.push(attributesSelector.selector + ":nth-of-type(" + position +
                     ")");
    }

    if (classSelector) {

      selectors.push(classSelector.selector + ":nth-of-type(" + position +
                     ")");
    }

    selectors.push(nodeNameSelector + ":nth-of-type("+ position +")");
  }

  var selectorMatches = selectors.map(function (selector) {

                          return getMatch(selector, currentElements);
                        }).sort(function (sel1, sel2) {

                          return sel1.percent - sel2.percent;
                        }),
      minSelectorPercent = selectorMatches[0].percent;

  for (var i = 1; i < selectorMatches.length; i++) {

    if (minSelectorPercent !== selectorMatches[i].percent) {
      break;
    }
  }

  selectorMatches = selectorMatches.slice(0, i)
                    .sort(function (match1, match2) {

                      var match1Prio = selectors.indexOf(match1.selector),
                          match2Prio = selectors.indexOf(match2.selector);

                      return match1Prio - match2Prio;
                    });

  selector = selectorMatches[0];

  var fullMatch = selector.match;

  selector = selector.selector;

  var useChildrenSlector = false;

  if (!areLeafNodes && !fullMatch) {

    var descendantMatch = getMatch(selector + " " + prevSelector,
                                         prevElements),
        childrenMatch   = getMatch(selector + " > " + prevSelector,
                                         prevElements);

    useChildrenSlector = childrenMatch.percent < descendantMatch.percent;
  }

  prevElements = currentElements;

  currentElements = currentElements.map(function (ele) {

                      return ele.parentNode;
                    });

  currentElements = _.uniq(currentElements);

  optimisedPath = selector + (areLeafNodes ? ""
                                           : useChildrenSlector ? " > "
                                                                : " ") +
                                             optimisedPath;

  console.log("Optimised Path", optimisedPath);

  if (fullMatch) {

    return optimisedPath;
  }

  return optimise(currentElements, optimisedPath, fullPath, selector, prevElements);
}

function optimiseCSSPath (cssPath) {

  if (!cssPath) {

    return "";
  }

  var targetElements = [];

  document.querySelectorAll(cssPath).forEach(function (element) {

    targetElements.push(element);
  });

  return optimise(targetElements, "", cssPath);
}

module.exports = {

  optimise: optimiseCSSPath
};
