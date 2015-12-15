"use strict";

var Sheet = require("./sheet"),
    sheet, $page, $container;

function getSheet ($p) {

  if (sheet) {

    return sheet;
  }

  $page = $p;
  $container = $page.children(".sheet-container");

  $page.addClass("has-sheet");

  sheet = new Sheet($container);
  return sheet;
}

function destroySheet () {

  $page.removeClass("has-sheet");
  $container.empty();

  sheet = $page = $container = null;
}

module.exports = {
  "destroySheet": destroySheet,
  "getSheet": getSheet
};
