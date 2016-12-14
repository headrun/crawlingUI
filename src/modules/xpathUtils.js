function areSiblingElements (ele1, ele2) {

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

  if (!paths || !Array.isArray(paths) || elements.length === 0) {

    return null;
  }

  var firstElementPaths = paths.shift().split(" > ");

  var pathsCanBeMerged = true,
      commomLength = firstElementPaths.length;

  var pathArrays = elements.map(paths, function (path) {

                     var currentPaths = path.split(" > ");

                     isSameLength = isSameLength
                                    && currentPaths.length !== commomLength;

                     return currentPaths;
                   });

  if (!isSameLength) {

    return paths;
  }

  var currentCommonPath = firstElementPaths[0],
      hasCommonPath = true;

  elements.forEach(pathArrays, function (pathArray, index) {

    if (!hasCommonPath)
      return

    var currentElementPath = pathArray[index],
        referencePath      = firstElementPaths[index];

    if (currentElementPath === referencePath) {

      currentCommonPath += " > " + currentElementPath;
      return;
    }

    var currentElement = document.querySelectorAll(currentCommonPath
                                                   + " > " + currentElementPath)[0],
        referenceElement = document.querySelectorAll(referencePath
                                                     + " > " + referencePath)[0];

    if (currentElement.nodeName !== referenceElement.nodeName) {

      hasCommonPath = false;
      return;
    }
  });
}

module.exports = {

  getElementCSSPath: getElementCSSPath
};
