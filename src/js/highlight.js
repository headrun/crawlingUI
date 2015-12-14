var $ = require("jquery");

var red = "#ea6153";
var boxSizing = "border-box";

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

$(function () {

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

      $target.removeAttr("ac-data-clicked");
    } else {

    backupStyle($target);

    $target.attr("ac-data-clicked", true)
	   .css({

	     border: "2px solid " + red
	   });
    }
  });
});
