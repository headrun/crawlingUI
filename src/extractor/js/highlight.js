(function () {
  "use strict";

  function init () {

    console.log("Guest onload executed");

    var $ = require("jquery"),
        DOMUtils = require("./DOMUtils"),
        ipc = require("electron").ipcRenderer,
        cssToXpath = require("css-to-xpath"),
        selectorLang = "xpath",
        document = window.document;

    var red = "#ea6153";

    var currentSelector = "";

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

    function deSelectAll () {

      /**
       * deSelect all elements that are previously selected
       *
       */

      currentSelector = "";

      $("[ac-data-clicked]").each(function () {

        deSelect($(this));
      });
    }

    function doSelect ($target) {

      /**
       * Restore any styles given on hover,
       * Backup existing styles and
       * Highlight the element by adding styles
       *
       * @param $target
       * @returns {*}
       */

      restoreStyle($target);

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

      if ($target.attr("ac-data-clicked")) {
        return;
      }

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

      if ($target.attr("ac-data-clicked")) {
        return;
      }

      restoreStyle($target);
    }

    function onClick (e) {

      /**
       * Click Handler, prevent default actions and propagations
       * and toggle highlight of the selected element
       *
       * @param e
       */

      if (e.ctrlKey) {

        return true;
      }

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      var $target = $(e.target),
          selector, commonSelector;

      if ($target.attr("ac-data-clicked")) {

        ipc.sendToHost(selectorLang, "");
      } else {

        selector = DOMUtils.getCSSSelector($target.get(0));

        if (currentSelector) {

          commonSelector = DOMUtils.getCommonCSSSelector([currentSelector,
                                                            selector]);

          selector = commonSelector || selector;
        }

        currentSelector = selector;

        selector = DOMUtils.optimise(selector);

        ipc.sendToHost(selectorLang, cssToXpath(selector));
      }

      return false;
    }

    function addEventListeners () {

      $("body").on("mouseover", handleMouseOver)
               .on("mouseout", onMouseOut)
               .on("click", onClick);
    }

    function removeEventListeners () {

      $("body").off("mouseover", handleMouseOver)
               .off("mouseout", onMouseOut)
               .off("click", onClick);
    }

    addEventListeners();

    function stopSelection () {

      /**
       * Un-Register event handlers and stop hightlighing
       * so that user can resume normal navigation
       */

       deSelectAll();
       removeEventListeners();
    }

    var commands = {

      "startSelection": function (selectors) {

        /**
         * Register event handlers and start hightlighing if
         * given any selectors
         *
         * @param selectors
         */

        console.log("Start selection");

        var that = this;

        if (!selectors || !selectors.length || selectors.length === 0) {

          selectors = [];
        }

        selectors.forEach(function (selector) {

          that.select(selector);
        });
      },
      "select": function (selector) {

        /**
         * given selector highlight the elements
         *
         * @param selector
         */

        if (!selector) {
          return;
        }

        var elements, currentElement;

        try {

          elements = document.evaluate(selector, document, null,
                                       window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
        } catch (e) {

          console.log(e);
          return;
        }

        console.log("snapshotLength " + elements.snapshotLength);

        const data = [];

        for (var i = 0; i < elements.snapshotLength; i++) {

          currentElement = elements.snapshotItem(i);

          if (currentElement) {

            data.push(currentElement.textContent);

            if (currentElement.nodeType === document.TEXT_NODE) {

              currentElement = $(currentElement).parent();
            } else if (currentElement.nodeType === document.ATTRIBUTE_NODE) {

              currentElement = $(currentElement.ownerElement);
            }else {

              currentElement = $(currentElement);
            }

            doSelect(currentElement);
          }
        }

        ipc.sendToHost("data", data);
      },
      "deSelect": function (selector) {

        /**
         * given selector, dehighlight it
         *
         * @param selector
         */

        if (!selector) {
          return;
        }

        var $elements = $(selector);

        $elements.each(function() {

          deSelect($(this));
        });
      },
      "deSelectAll": function () {

        deSelectAll();
      },
      "stopSelection": function () {

        /**
         * Un-Register event handlers and deSelect any
         * selected elements
         */

        stopSelection();
      },
      "content": function (selector) {

        selector = selector || currentSelector;

        var content = [], currentElement, elements;

        if (selectorLang === "xpath") {

          elements = document.evaluate(selector, document);

          do {

            currentElement = elements.iterateNext();

            if (currentElement) {

              content.push(currentElement.textContent);
            }
          } while (currentElement);
        } else if(selectorLang === "css") {

          $(selector).each(function () {

            content.push($(this).text());
          });
        }

        ipc.sendToHost("content", content);

        return content;
      }
    };

    /*
     * Listen for commands from Host and do appropriate
     * actions
     */
    ipc.on("command", function (e, name, value) {

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

        case "deSelectAll":
          method = "deSelectAll";
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
  }

  window.addEventListener("DOMContentLoaded", init);

}());
