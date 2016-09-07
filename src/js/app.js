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
      ko.applyBindings(app.lvm, document.getElementById("wikipediaModal"));
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

  var isMapInitialized = app.map.initializeMap();
  var d = new Date();
  if (isMapInitialized) {
    app.lvm.initGoogleMaps();
  }


  var closeSideBar = function() {
      $('.sidebar').removeClass('expand').animate({'left': '-240px'},800);
      setTimeout(function() {
        $('.sidebar-hamburger').removeClass('expand');
        //$('.sidebar').animate({'left': '-240px'},200);
      },550);
    };
  var openSideBar = function() {
      $('.sidebar').addClass('expand').animate({'left': '0px'},800);
      setTimeout(function() {
        $('.sidebar-hamburger').addClass('expand');
        //$('.sidebar').animate({'left': '0px'},600);
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