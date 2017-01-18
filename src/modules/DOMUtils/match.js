var utils = require("utils");

function getMatch (path, nodes) {

  /**
   * Give a patha and NodeList, returns if both sets match
   *
   * @param {String} path
   * @param {Array} nodes
   */

  var nodesByPath    = document.querySelectorAll(path),
      numNodes       = nodes.length,
      numNodesByPath = nodesByPath.length;

  var numMatching = 0;

  for (var i = 0, currentNode; i < numNodes; i++) {

    currentNode = nodes[i];

    for (var j = 0, currentPathNode; j < numNodesByPath; j++) {

      if (currentNode === nodesByPath[j]) {

        numMatching++;
        break;
      }
    }
  }

  return {
          "match": numNodesByPath === numNodes && numNodes === numMatching,
          "percent": (numNodesByPath / numNodes) * 100,
          "selector": path
         };
}

function getBestMatch (nodeName, nodes, getSelectors) {

  var selectors = getSelectors(nodes),
      selectorsPrio = {};

  if (selectors.length === 0) {

    return;
  }

  var selectorCombinations = [];

  selectors.forEach(function (selector, index) {

    selectorsPrio[selector] = index;
  });

  selectors = utils.subsets(selectors).sort(function (sel1Group, sel2Group) {

                var sel1Prio = sel1Group.reduce(function (sel1, sel2) {

                                 return selectorsPrio[sel1] + selectorsPrio[sel2];
                               }, 0),
                    sel2Prio = sel2Group.reduce(function (sel1, sel2) {

                                 return selectorsPrio[sel1] + selectorsPrio[sel2];
                               }, 0);

                return sel1Prio - sel2Prio;
              }).map(function (selGroup) {

                return nodeName + selGroup.join("");
              });

  selectorsPrio = {};

  selectors.forEach(function (selector, index) {

    selectorsPrio[selector] = index;
  });

  var matches = selectors.map(function (selector) {

                  return getMatch(selector, nodes);
                }).sort(function (match1, match2) {

                  return match1.percent - match2.percent;
                });

  var lowestMatchPercent = matches[0].percent;

  for (var i = 1; i < matches.length; i++) {

    if (matches[i] > lowestMatchPercent) {

      matches = matches.slice(0, i);
      break;
    }
  }

  matches.sort(function (match1, match2) {

    var match1Prio = selectorsPrio[match1.selector],
        match2Prio = selectorsPrio[match2.selector];

    return match1Prio - match2Prio;
  });

  return matches[0];
}

module.exports = {

  getMatch    : getMatch,
  getBestMatch: getBestMatch
};
