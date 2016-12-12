function getSiblingIndex (element) {

  var index = 0;

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

    label = label + ":nth-child(" + getSiblingIndex(element) + ")";

    return label;
};

function getElementCSSPath = function(element, includeIds) {

    var paths = [];

    for (; element && element.nodeType == 1; element = element.parentNode)
    {
        var selector = getElementCSSSelector(element, includeIds);
        paths.splice(0, 0, selector);
    }

    return paths.length ? paths.join(" > ") : null;
};

module.exports = {

  getElementCSSPath: getElementCSSPath
};
