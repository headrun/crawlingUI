"use strict";

var _ = require("underscore"),
    Q = require("q"),
    ipc = require("electron").ipcRenderer;

var requests = {};

// Need to do channel support, instead of hardcoding "sheet"
var channel = "sheet";

function send() {

  var args = Array.prototype.slice.apply(arguments, []);

  var uniqueId = _.uniqueId();

  var d = requests[uniqueId] = Q.defer();

  args = [channel, uniqueId].concat(args);

  ipc.sendToHost.apply(ipc, args);

  return d.promise;
}

ipc.on(channel, function (e, uniqueId, retVal) {

  requests[uniqueId].resolve(retVal);
});

module.exports = {"send": send};
