var _ = require("underscore"),
    utils = require("./utils.js");

function areSiblingElements (ele1, ele2) {

  /**
   * given two different elements, find if they are siblings
   */

  var areSiblings = false,
      prevSibling = ele1.previousSibling,
      nextSibling = ele1.nextSibling;

  while (prevSibling) {

    if (prevSibling === ele2) {

      areSiblings = true;
      break;
    }

    prevSibling = ele1.prevSibling;
  }

  if (areSiblings)
    return true;

  while (nextSibling) {

    if (nextSibling === ele2) {

      areSiblings = true;
      break;
    }

    nextSibling = ele1.nextSibling;
  }

  return areSiblings;
}

function getSiblingIndex (element) {

  var index = 1;

  for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
  {
      // Ignore document type declaration.
      if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
          continue;

      if (sibling.nodeName == element.nodeName)
          ++index;
  }

  return index;
}

function getElementCSSSelector (element) {

    if (!element || !element.localName)
        return "null";

    var label = element.localName.toLowerCase();

    var hasSibling   = element.previousSibling || element.nextSibling,
        siblingIndex = getSiblingIndex(element);

    if (label === "html" || label === "body") {

      return label;
    }

    label = label + (hasSibling
                     ? ":nth-of-type(" + siblingIndex + ")"
                     : "");

    return label;
};

function getElementCSSPath (element, includeIds, seperatePaths) {

    var paths = [];

    for (; element && element.nodeType == 1; element = element.parentNode)
    {
        var selector = getElementCSSSelector(element, includeIds);
        paths.splice(0, 0, selector);
    }

    return paths.length ? (seperatePaths ? paths : paths.join(" > ")) : null;
};

function getCommonCSSPath (paths) {

  if (!paths || !Array.isArray(paths) || paths.length === 0) {

    return null;
  }

  var firstElementPaths = paths.shift().split(" > ");

  var pathsCanBeMerged = true,
      commomLength = firstElementPaths.length,
      isSameLength = true;

  var pathArrays = paths.map(function (path) {

                     var currentPaths = path.split(" > ");

                     isSameLength = isSameLength
                                    && currentPaths.length === commomLength;

                     return currentPaths;
                   });

  if (!isSameLength) {

    return null;
  }

  var currentCommonPath = [],
      hasCommonPath = true;

  pathArrays[0].forEach(function (currentElementPath, index) {

    if (!hasCommonPath)
      return

    var referencePath = firstElementPaths[index];

    if (currentElementPath === referencePath) {

      if (currentCommonPath.length === 0) {

        currentCommonPath = currentElementPath;
      } else {

        currentCommonPath += " > " + currentElementPath;
      }

      return;
    }

    var currentElement = document.querySelectorAll(currentCommonPath
                                                   + " > " + currentElementPath)[0],
        referenceElement = document.querySelectorAll(currentCommonPath
                                                     + " > " + referencePath)[0];

    if (currentElement.nodeName !== referenceElement.nodeName) {

      hasCommonPath = false;
      return;
    }

    currentCommonPath += " > " + currentElement.nodeName.toLowerCase();
  });

  return hasCommonPath ? currentCommonPath : null;
}

var attributesWhitelist = ["id", "itemprop", "name", /^data.*$/,
                           "for", "disabled", "type", "colspan",
                           "rowspan", "rel", "required"]
    attributesWhitelistPrority = {};


attributesWhitelist.forEach(function (attribute, index) {

  attributesWhitelistPrority[attribute] = index;
});

function getAttributesSelectors (nodes) {

  var commonArributesHash = {},
      allAttributes = nodes[0].attributes;

  if (allAttributes.length === 0) {

    return [];
  }

  for (var i = 0, name, value; i < allAttributes.length; i++) {

    name = allAttributes[i].name.toLowerCase();
    value = allAttributes[i].value;

    if (attributesWhitelist.indexOf(name) < 0) {

      continue;
    }

    commonArributesHash[name] = value;
  }

  var commonArributesList = Object.keys(commonArributesHash);

  for (var i=0, node; i < nodes.length; i++) {

    node = nodes[i];

    for (var j = 0, attrName, attrValue; j < commonArributesList.length; j++) {

      attrName = commonArributesList[j];
      attrValue = commonArributesHash[attrName];

      var nodeAttrValue, removeAttribute;

      if (!node.hasAttribute(attrName)) {

        removeAttribute = true;
      } else {

        nodeAttrValue = node.getAttribute(attrName);
        removeAttribute = attrValue !== nodeAttrValue;
      }

      if (removeAttribute) {

        delete commonArributesHash[attrName];
      } else {

        commonArributesHash[attrName] = attrValue;
      }
    }

    commonArributesList = Object.keys(commonArributesHash);
  }

  commonArributesList.sort(function (attr1, attr2) {

    var attr1Prio = attributesWhitelistPrority[attr1],
        attr2Prio = attributesWhitelistPrority[attr2];

    if (attr1Prio > attr2Prio) {

      return 1;
    }

    if (attr1Prio < attr2Prio) {

      return -1;
    }

    return 0;
  });

  return commonArributesList.map(function (attributeName) {

    return "["+ attributeName +"=\""
              + commonArributesHash[attributeName].replace("\"", "\\\"") + "\"]";
  });
}

function getClassArray (className) {

  return className.trim() ?
         className.trim().split(/\s+/) :
         [];
}

function getClassSelectors (nodes) {

  if (!Array.isArray(nodes) || nodes.length === 0)  {

    return [];
  }

  var node = nodes[0],
      existingClasses = getClassArray(node.className);

  nodes = nodes.slice(1);

  nodes.forEach(function (node) {

    var classes = getClassArray(node.className);

    existingClasses = _.intersection(existingClasses, classes);
  });

  return existingClasses.map(function (className) {

    return "." + className;
  });
}

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

      if (currentNode === nodesByPath.item(j)) {

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

                if (sel1Prio < sel2Prio) {

                  return -1;
                }

                if (sel1Prio > sel2Prio) {

                  return 1;
                }

                return 0;
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

function optimise (currentElements, optimisedPath, fullPath, prevSelector, prevElements) {

  if (fullPath.length === 0 || currentElements.length === 0) {

    return;
  }

  var areLeafNodes = optimisedPath.length === 0,
      currentPath;

  var fullPathArray = fullPath.split(" > ");

  var positionSelector = fullPathArray.pop(),
      position = (positionSelector.match(/\((\d+)\)/) || [])[1],
      nodeNameSelector = positionSelector.match(/^[^\:$]+/)[0];

  fullPath = fullPathArray.join(" > ");

  var matches = [], match, currentMatchPriority = {};

  currentMatchPriority[nodeNameSelector] = 1;

  var selector = nodeNameSelector,
      selectors = [],
      selectorsPrio = {},
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

  if (position) {

    if (attributesSelector) {

      selectors.push(attributesSelector.selector + ":nth-of-type("
                     + position + ")");
    }

    if (classSelector) {

      selectors.push(classSelector.selector + ":nth-of-type("
                     + position + ")");
    }
  }

  if (selectors.length === 0) {

    selectors.push(nodeNameSelector);
  }

  var selectorMatches = selectors.map(function (selector) {

                          return getMatch(selector, currentElements);
                        }).sort(function (sel1, sel2) {

                          return sel1.percent - sel2.percent;
                        }),
      minSelectorPercent = selectorMatches[0].percent;

  for (var i = 1; i < selectorMatches.length; i++) {

    if (minSelectorPercent !== selectorMatches[i].percent)
      break;
  }

  selectorMatches = selectorMatches.slice(0, i)
                    .sort(function (match1, match2) {

                      var match1Prio = selectors.indexOf(match1.selector),
                          match2Prio = selectors.indexOf(match2.selector);

                      return match1Prio - match2Prio;
                    });

  selector = selectorMatches[0];

  var fullMatch = selector.match;

  selector = selector.selector

  var useChildrenSlector = false;

  if (!areLeafNodes && !fullMatch) {

    var descendantMatch = getMatch(selector + " " + prevSelector, prevElements),
        childrenMatch   = getMatch(selector + " > " + prevSelector, prevElements);

    useChildrenSlector = childrenMatch.percent < descendantMatch.percent;
  }

  var prevElements = currentElements;

  currentElements = currentElements.map(function (ele) {

                      return ele.parentNode;
                    });

  optimisedPath = selector + (areLeafNodes ? ""
                                           : useChildrenSlector ? " > "
                                                                : " ")
                           + optimisedPath;

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

  getElementCSSPath: getElementCSSPath,
  getCommonCSSPath : getCommonCSSPath,
  optimise: optimiseCSSPath
};
