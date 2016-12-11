"use strict";

var $ = require("jquery"),
    ipc = require("./ipcAdapter"),
    xpathUtils = require("./xpathUtils");

var red = "#ea6153";

var sheet;

function backupStyle($target) {

  var prevStyle = $target.attr("style");

  $target.attr("ac-prev-style", prevStyle);
}

function restoreStyle ($target) {

  var prevStyle = $target.attr("ac-prev-style");

  if (prevStyle) {

    $target.attr("style", prevStyle);
  } else {

    $target.removeAttr("style");
  }
}

function doHighlight ($target) {

  backupStyle($target);

  $target.attr("ac-data-clicked", true)
         .css({

           border: "2px solid " + red
         }); 

  console.log($target.text());

  ipc.send("setVal", $target.text());
}

function getSheet () {

  return new Promise(function (resolve, reject) {

    if (sheet) {

      return resolve(sheet);
    }

    ipc.send("getSheet")
       .then(function (sheetObj) {

               sheet = sheetObj;
               resolve(sheet);
       })
       .catch(function (e) {

         reject(e);
       });

  });
}

$(function () {

  var numClicked = 0;

  $("body").on("mouseover", function (e) {

    var $target = $(e.target);

    if ($target.attr("ac-data-clicked")) {

      return;
    }

    backupStyle($target);

    $target.css({

      border: "1px dashed " + red
    });

  }).on("mouseout", function (e) {

    var $target = $(e.target);

    if ($target.attr("ac-data-clicked")) {

      return;
    }

    restoreStyle($target);
  }).on("click", function (e) {

    e.preventDefault();
    e.stopImmediatePropagation();

    var $target = $(e.target);

    restoreStyle($target);

    if ($target.attr("ac-data-clicked")) {

      numClicked--;
      $target.removeAttr("ac-data-clicked");

      if (numClicked === 0) {

        ipc.send("sheet", "destroySheet");
      }
    } else {

      var selector = xpathUtils.getElementCSSSelector($target.get(0)),
          elements = $target.siblings(selector);

      console.log(selector);

      numClicked = elements.length;

      console.log(elements.length);

      getSheet().then(function () {

        doHighlight($target);

        $.each(elements, function () {

          doHighlight($(this));
        });
      }).catch(function (e) {

        console.log(e);
      });
    }
  });
});
