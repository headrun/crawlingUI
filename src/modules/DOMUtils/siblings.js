"use strict";

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

  if (areSiblings) {

    return true;
  }

  while (nextSibling) {

    if (nextSibling === ele2) {

      areSiblings = true;
      break;
    }

    nextSibling = ele1.nextSibling;
  }

  return areSiblings;
}

function getPrevSiblings (node, ofSameName) {

  var sibling,
      siblings = [],
      nodeName = node.nodeName.toLowerCase();

  if (nodeName === window.Node.DOCUMENT_TYPE_NODE) {

    return siblings;
  }

  for (sibling = node.previousSibling; sibling; sibling = sibling.previousSibling)
  {

    if (ofSameName && nodeName !== sibling.nodeName.toLowerCase()) {

      continue;
    }

    siblings.push(sibling);
  }

  return siblings;
}

function getNextSiblings (node, ofSameName) {

  var sibling,
      siblings = [],
      nodeName = node.nodeName.toLowerCase();

  if (nodeName === window.Node.DOCUMENT_TYPE_NODE) {

    return siblings;
  }

  for (sibling = node.nextSibling; sibling; sibling = sibling.nextSibling)
  {

    if (ofSameName && nodeName !== sibling.nodeName.toLowerCase()) {

      continue;
    }

    siblings.push(sibling);
  }

  return siblings;
}

function getSiblings (node, ofSameName) {

  var siblings = [];

  siblings = siblings.concat(getPrevSiblings(node, ofSameName))
                     .concat(getNextSiblings(node, ofSameName));

  return siblings;
}

function getSiblingIndex (element) {

  var prevSiblings = getPrevSiblings(element, true);

  return prevSiblings.length + 1;
}

module.exports = {

  areSiblingElements: areSiblingElements,
  getPrevSiblings   : getPrevSiblings,
  getNextSiblings   : getNextSiblings,
  getSiblings       : getSiblings,
  getSiblingIndex   : getSiblingIndex
};
