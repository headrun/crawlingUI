"use strict";

var $ = require("jquery"),
    router = require("./router"),
    sheetAdapter = require("./sheetAdapter");

var $pages   = $("body > div.page"),
    $home    = $pages.filter(".home"),
    $webview = $pages.filter(".webview");

var $sheetContainer = $webview.children(".sheet-container"),
    $addColumn      = $sheetContainer.find("span.add-column"),
    $saveSheet      = $sheetContainer.find("span.save");

$home.on("submit", "form", function (e) {

  e.preventDefault();

  var $form = $(this),
      $formGroup = $form.children(),
      $input = $formGroup.children(),
      inputVal = $input.val().trim();

  if (inputVal.length === 0) {

    $formGroup.addClass("has-error");
    return;
  }

  if (inputVal.indexOf("http") !== 0) {

    inputVal = "http://" + inputVal;
  }

  $formGroup.removeClass("has-error");

  inputVal = window.encodeURIComponent(inputVal);

  router.routeTo("webview/" + inputVal);
});

$webview.on("keyup", "div.addressbar > input", function (e) {

  var $input = $(this),
      val    = $input.val().trim();

  if (e.which === 13) {

    router.routeTo("webview/" + window.encodeURIComponent(val));
    return;
  }

  if (val === $input.attr("data-prev")) {

    return;
  }

  if (val.length === 0) {

    router.routeTo("/");
    return;
  }
});

function preRoute () {

  $pages.addClass("hide");
}

function home () {

  $home.removeClass("hide")
       .find("form input")
       .val("")
       .focus();
}

var sheet;

function webview (url) {

  url = window.decodeURIComponent(url);

  $webview.removeClass("hide")
	  .find("div.addressbar > input")
	  .attr("data-prev", url)
	  .val(url);

  var $content = $webview.children("div.webview-content")
                         .addClass("loading");

  $content.find("webview").remove();

  var $frame = $("<webview src=\""+ url +"\"></webview>"),
       frame = $frame.get(0);

  $frame.attr("preload", "./js/highlight.js");

  $frame.on("did-stop-loading", function () {

    $content.removeClass("loading");
  }).on("ipc-message", function (e) {

    e = e.originalEvent;

    if (e.channel !== "sheet") {
 
      return;
    }

    var args = e.args,
	method = args[1],
        uniqueId = args[0];

    args = args.slice(2);

    var retVal;

    if (method === "getSheet") {

      retVal = sheet = sheetAdapter.getSheet($webview);
    } else if (method === "destroySheet") {

      retVal = sheet = sheetAdapter.destroySheet();
    } else {

      if (!sheet) {

	console.log("Sheet not defined");
        return;
      }

      retVal = sheet[method].apply(sheet, args);
    }

    frame.send("sheet", uniqueId, retVal);

  }).on("console-message", function (e) {

    e = e.originalEvent;

    console.log(e.message);
  });

  $frame.appendTo($content);
}

$addColumn.on("click", function () {

  if (!sheet) {

    return;
  }

  sheet.addColumn();
});

module.exports = {

  preRoute: preRoute,
  home    : home,
  webview : webview
};
