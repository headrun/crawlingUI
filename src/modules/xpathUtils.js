var _ = require("underscore");

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

    return paths;
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

function getMatch (path, nodes) {

  /**
   * Give a patha and NodeList, returns if both sets match
   *
   * @param {string} path
   * @param {NodeList} nodes
   */

  console.log(path + " in getMatch");

  if (!(nodes instanceof NodeList)) {

    throw new Error("Expected NodeList, got " + typeof nodes);
  }

  var nodesByPath    = document.querySelectorAll(path),
      numNodes       = nodes.length,
      numNodesByPath = nodesByPath.length;

  if (numNodesByPath !== numNodes) {

    return false;
  }

  var numMatching = 0;

  for (var i = 0, currentNode; i < numNodes; i++) {

    currentNode = nodes.item(i);

    for (var j = 0, currentPathNode; j < numNodesByPath; j++) {

      if (currentNode === nodesByPath.item(j)) {

        numMatching++;
        break;
      }
    }
  }

  return {
          "match": numNodes === numMatching,
          "percent": (numMatching/numNodes) * 100
         };
}

function getAttributesSelector (nodes) {

  var commonArributesHash = {},
      allAttributes = nodes.item(0).attributes,
      selector = "";

  if (allAttributes.length === 0) {

    return "";
  }

  for (var i = 0, name, value;i < allAttributes.length; i++) {

    name = allAttributes[i].name.toLowerCase();
    value = allAttributes[i].value;

    if (name === "style") {

      continue;
    }

    if (name === "class") {

      commonArributesHash[name] = value.split(/\s+/);
    } else {

      commonArributesHash[name] = value;
    }
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

        if (attrName === "class") {

          attrValue = _.intersection(attrValue, nodeAttrValue.split(/\s+/));

          removeAttribute = attrValue.length === 0;
        } else {

          removeAttribute = attrValue !== nodeAttrValue;
        }
      }

      if (removeAttribute) {

        delete commonArributesHash[attrName];
      }

      commonArributesList = Object.keys(commonArributesHash);
    }
  }

  for (var attributeName in commonArributesHash) {

    if (attributeName === "class") {

      selector += "." + commonArributesHash[attributeName].join(".");
    } else {

      selector += "["+ attributeName +"=\""
                  + commonArributesHash[attributeName] + "\"]";
    }
  }

  return selector;
}

function _optimise (nodes, subPath, optimisedPath) {

  if (!subPath) {

    return optimisedPath;
  }

  var currentPath = optimisedPath = optimisedPath || "";

  isLeafNode = optimisedPath.length === 0;

  console.log("subpath   " + subPath );

  subPath = subPath.split(" > ");

  var positionSelector = subPath.pop(),
      nodeName = positionSelector.match(/^[^\:$]+/)[0];

  var matches = [], match;

  currentPath = nodeName + (!isLeafNode ? " " + optimisedPath
                                        : "");

  match = getMatch(currentPath, nodes);

  if (match.match) {

    return currentPath;
  }

  matches.push({"selector": currentPath, "matchPercent": match.percent});

  var attributesSelector = getAttributesSelector(nodes);

  currentPath = nodeName + attributesSelector + (!isLeafNode ? " " + optimisedPath
                                                             : "");

  match = getMatch(currentPath, nodes);

  if (match.match) {

    return currentPath;
  }

  matches.push({"selector": currentPath, "matchPercent": match.percent});

  if (!isLeafNode) {

    currentPath = nodeName + attributesSelector + " > " + optimisedPath;

    match = getMatch(currentPath, nodes);

    if (match.match) {

      return currentPath;
    }

    matches.push({"selector": currentPath, "matchPercent": match.percent});
  }

  var currentPath      = positionSelector + (!isLeafNode ? " " + optimisedPath
                                                         : "");

  subPath = subPath.join(" > ");

  match = getMatch(currentPath, nodes);

  if (match.match) {

    return currentPath;
  }

  matches.push({"selector": currentPath, "matchPercent": match.percent});

  if (!isLeafNode) {

    currentPath = positionSelector + " > " + optimisedPath;

    match = getMatch(currentPath, nodes);

    if (match.match) {

      return currentPath;
    }

    matches.push({"selector": currentPath, "matchPercent": match.percent});
  }

  matches.sort(function (match1, match2) {

    if (match1.matchPercent > match2.matchPercent) {

      return -1;
    }

    if (match1.matchPercent < match2.matchPercent) {

      return 1;
    }

    return 0;
  });

  optimisedPath = matches[0].selector;

  return _optimise(nodes, subPath, optimisedPath);
}

function optimise (path) {

  if (!path)
    return "";

  nodes = document.querySelectorAll(path);

  return _optimise(nodes, path);
}

module.exports = {

  getElementCSSPath: getElementCSSPath,
  getCommonCSSPath : getCommonCSSPath,
  optimise         : optimise
};
