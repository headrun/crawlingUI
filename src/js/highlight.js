"use strict";

var $ = require("jquery"),
    ipc = require("./ipcAdapter");

var red = "#ea6153";

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

  ipc.send("setVal", $target.text());
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
    e.stopPropagation();

    var $target = $(e.target);

    restoreStyle($target);

    if ($target.attr("ac-data-clicked")) {

      numClicked--;
      $target.removeAttr("ac-data-clicked");

      if (numClicked === 0) {

        ipc.send("sheet", "destroySheet");
      }
    } else {

      if (numClicked === 0) {

        ipc.send("getSheet")
           .then(function (sheet) {

	     console.log("Fucked here");

	     try {

	       doHighlight($target);
	     } catch (e) {

	       console.log(e.message);
             }
           });
      } else {

        doHighlight($target);
      }

      numClicked++;
    }
  });
});
