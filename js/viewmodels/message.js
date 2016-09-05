"use strict";
var app = app || {};

(function() {
  var messageViewModel = function() {
    var self = this;
    self.messageList = ko.observableArray([]);
    this.addMessage = function(component, message, kind, duration) {
      var message = new Message( {
        component: component,
        text: message,
        kind: kind
      });
      self.messageList.unshift(message);
      if (duration && duration > 0) {
        setTimeout(function () {
          self.messageList.remove(message);
        },duration);
      }
      if (component === "Wikipedia") {
        if (this.wikipediaMessage) {
          var oldMessage = this.wikipediaMessage();
          self.messageList.remove(oldMessage);
          self.wikipediaMessage(message);
        }
        else {
          this.wikipediaMessage = ko.observable(message);
        }
      }
    };

    this.dismissMessage = function(message) {
      self.messageList.remove(message);
    };

    this.dismissAllMessages = function() {
      self.messageList.removeAll();
    }

  };
  app.mvm = new messageViewModel();
})();