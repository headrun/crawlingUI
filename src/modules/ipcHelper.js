"use strict";

function IPCHelper (webview) {

  if (!webview) {

    throw {"message": "webview is required as first argument"};
  }

  if (!(this instanceof IPCHelper)) {

    return new IPCHelper(webview);
  }

  var promises = {};

  this.send = function send (...args) {

    var messageId = (new Date()).getTime();

    args = [messageId, ...args];

    promises[messageId] = new Promise();

    webview.send(...args);
  };

  function onMessage (messageId, resp) {

    if (!promises[messageId]) {

      return;
    }

    promises.resolve(resp);
  }

  function bindEvents () {

    webview.addEventListener("ipc-message", onMessage);
  }

  function unBindEvents () {

    webview.removeEventListener("ipc-message", onMessage);
  }

  this.destroy = function destroy () {

    unBindEvents();
  };

  bindEvents();
}

export default IPCHelper;
