var $ = require("jquery"),
    router = require("./router");

var $pages   = $("body > div.page"),
    $home    = $pages.filter(".home"),
    $webview = $pages.filter(".webview");


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

function webview (url) {

  url = window.decodeURIComponent(url);

  $webview.removeClass("hide")
	  .find("div.addressbar > input")
	  .attr("data-prev", url)
	  .val(url);

  var $content = $webview.children("div.webview-content")
                         .addClass("loading");

  $content.find("webview").remove();

  var $frame = $("<webview src=\""+ url +"\"></webview>");

  $frame.attr("preload", "./js/highlight.js");

  $frame.on("did-stop-loading", function () {

    $content.removeClass("loading");
  });

  $frame.appendTo($content);
}

module.exports = {

  preRoute: preRoute,
  home    : home,
  webview : webview
};
