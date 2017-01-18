var _ = require("underscore");

function getElementCSSSelector (element) {

    if (!element || !element.localName)
        return "null";

    var label = element.localName.toLowerCase();

    if (label === "html" || label === "body") {

      return label;
    }

    var hasSibling   = element.previousSibling || element.nextSibling,
        prevSiblingIndex = siblings.getSiblingIndex(element),
        shouldHaveSiblingIndex = true;

    if (hasSibling) {

      if (prevSiblingIndex === 1
          && siblings.getNextSiblings(element, true).length === 0) {

        shouldHaveSiblingIndex = false;
      }
    } else {

      shouldHaveSiblingIndex = false;
    }

    if (shouldHaveSiblingIndex) {

      label = label + ":nth-of-type(" + prevSiblingIndex + ")";
    }

    return label;
};

function getCSSSelector (element, includeIds, seperatePaths) {

    var paths = [];

    for (; element && element.nodeType == 1; element = element.parentNode)
    {
        var selector = getElementCSSSelector(element, includeIds);
        paths.splice(0, 0, selector);
    }

    return paths.length ? (seperatePaths ? paths : paths.join(" > ")) : null;
};

function getCommonCSSSelector (paths) {

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

var attributesWhitelist = ["id", "itemprop", "name", /^data-.*$/,
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

  var classNames = className.trim()
                     ? className.trim().split(/\s+/)
                     : [];

  return classNames.filter(function (className) {

    return (/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/).test(className);
  });
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

module.exports = function () {

  getElementCSSSelector: getElementCSSSelector,
  getCSSSelector       : getCSSSelector,
  getCommonCSSPath     : getCommonCSSPath
};
