var app = app || {};

(function() {
  "use strict";
  app.bindMessagesVM = function() {
    if (typeof ko !== undefined) {
      ko.applyBindings(app.mvm, document.getElementById("messages"));
      delete app.bindMessagesVM;
    }
  };

  app.bindLocationsVM = function() {
    if (typeof ko !== undefined) {
      ko.applyBindings(app.lvm, document.getElementById("locations"));
      ko.applyBindings(app.lvm, document.getElementById("apiModal"));
      ko.applyBindings(app.lvm, document.getElementById("options"));
      delete app.bindLocationsVM;
    }
  };

  if(typeof ko !== undefined) {
    if (app.mvm) {
      app.bindMessagesVM();
    }
    if (app.lvm) {
      app.bindLocationsVM();
    }
  }

})();

$(function() {
  if (typeof app.bindMessagesVM === "function") {
    app.bindMessagesVM();
  }
  if (typeof app.bindLocationsVM === "function") {
    app.bindLocationsVM();
  }


  var closeSideBar = function() {
      $('.sidebar').removeClass('expand').animate({'left': '-240px'},800);
      setTimeout(function() {
        $('.sidebar-hamburger').removeClass('expand');
      },550);
    };
  var openSideBar = function() {
      $('.sidebar').addClass('expand').animate({'left': '0px'},800);
      setTimeout(function() {
        $('.sidebar-hamburger').addClass('expand');
      },250);
  };

  $('.sidebar-button').click(function() {
    if ($('.sidebar-hamburger').hasClass('expand')) {
      closeSideBar();
      $('main').off('click', closeSideBar);
    }
    else {
      openSideBar();
      $('main').on('click', closeSideBar);
    }
  });
});