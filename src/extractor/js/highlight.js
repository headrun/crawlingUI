var $ = require("jquery"),
    xpathUtils = require("./xpathUtils.js"),
    ipc = require("electron").ipcRenderer;

var red = "#ea6153";

var selectedNodes = [];

function backupStyle($target) {

  /**
   * Store the current style of the element into an
   * attribute called 'ac-prev-style', to restore later
   *
   * @param $target
   * @returns {*}
   */

  return $target.attr("ac-prev-style",
                      $target.attr("style"));
}

function restoreStyle ($target) {

  /**
   * Restore the original style of the element
   *
   * @param $target
   * @returns {*}
   */

  var prevStyle = $target.attr("ac-prev-style");

  $target.removeAttr("ac-prev-style");

  return (

    prevStyle ? $target.attr("style", prevStyle)
              : $target.removeAttr("style")
  );
}

function deSelect($target) {

  /**
   * Restore the styles and attributes of the elements
   *
   * @param $target
   * @returns {*}
   */

   restoreStyle($target);
   return $target.removeAttr("ac-data-clicked");
}

function doSelect ($target) {

  /**
   * Backup existing styles and
   * Highlight the element by adding styles
   *
   * @param $target
   * @returns {*}
   */

  backupStyle($target);

  return $target.attr("ac-data-clicked", true)
                .css({
                       outline: "2px solid " + red
                     });
}

function handleMouseOver (e) {

  /**
   * Event handler for 'mouseover' event
   * Backup and Highlight the element with dashed red border if
   * its not already selected
   *
   * @param e
   */

  var $target = $(e.target);

  if ($target.attr("ac-data-clicked"))
    return;

  backupStyle($target);

  $target.css({
    outline: "1px dashed " + red
  });
}

function onMouseOut (e) {

  /**
   * Event handler for 'mouseout' Event
   * Remove the highlight and restore the old styles
   *
   * @param e
   */

  var $target = $(e.target);

  if ($target.attr("ac-data-clicked"))
    return;

  restoreStyle($target);
}

function onClick (e) {

  /**
   * Click Handler, prevent default actions and propagations
   * and toggle highlight of the selected element
   *
   * @param e
   */

  e.preventDefault();
  e.stopImmediatePropagation();

  var $target = $(e.target),
      selector;

  if ($target.attr("ac-data-clicked")) {

    deSelect($target);
  } else {

    doSelect($target);
    selector = xpathUtils.getElementCSSPath($target.get(0));
    ipc.sendToHost("cssPath", selector);
  }
}

function highlightByCssPath (path) {

  /**
   * Given a css selector , highlights them
   *
   * @param path
   * @returns {*}
   */

  return $(path).each(function () {

    doSelect($(this));
  });
}

function startHighlight () {

  /**
   * Register event handlers and start highlighting
   * elements
   *
   * @returns {Promise}
   */

  return new Promise(function (resolve) {

    $(function () {

      $("body").on("mouseover", handleMouseOver)
               .on("mouseout", onMouseOut)
               .on("click", onClick);

      resolve();
    });
  });
}

function stopSelection () {

  /**
   * Un-Register event handlers and stop hightlighing
   * so that user can resume normal navigation
   */

   $("[ac-data-clicked]").each(function () {

     deSelect($(this));
   });

   $("body").off("mouseover", handleMouseOver)
            .off("mouseout", onMouseOut)
            .off("click", onClick);
}

var commands = {

  "startSelection": function (selectors) {

    /**
     * Register event handlers and start hightlighing if
     * given any selectors
     *
     * @param selectors
     */

    if (!selectors || !selectors.length || selectors.length === 0) {

      selectors = [];
    }

    startHighlight().then(function () {

      selectors.forEach(function (selector) {

        this.select(selector);
      });
    });
  },
  "select": function (selector) {

    /**
     * given selector highlight the elements
     *
     * @param selector
     */

    if (!selector)
      return;

    var $elements = $(selector);

    $elements.each(function() {

      doSelect($(this));
    });
  },
  "deSelect": function (selector) {

    /**
     * given selector, dehighlight it
     *
     * @param selector
     */

    if (!selector)
      return;

    var $elements = $(selector);

    $elements.each(function() {

      deSelect($(this));
    });
  },
  "stopSelection": function () {

    /**
     * Un-Register event handlers and deSelect any
     * selected elements
     */

    stopSelection();
  }
};

/*
 * Listen for commands from Host and do appropriate
 * actions
 */
ipc.on("command", function (e, name, value) {

  console.log("Got Command");
  console.log(e);
  console.log(name);
  console.log(value);

  var method;

  switch (name) {
    case "startSelection":

      method = "startSelection";
      break;
    case "select":

      method = "select";
      break;

    case "deselect":

      method = "deselect";
      break;

    case "stopSelection":

      method = "stopSelection";
      break;

    default:

  }

  if (method) {

    commands[method](value);
  }
});