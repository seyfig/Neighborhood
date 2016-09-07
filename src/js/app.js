var app = app || {};

// (function() {



// })();

$(function() {

  "use strict";
  ko.applyBindings(app.mvm, document.getElementById("messages"));
  ko.applyBindings(app.lvm, document.getElementById("locations"));
  ko.applyBindings(app.lvm, document.getElementById("wikipediaModal"));
  ko.applyBindings(app.lvm, document.getElementById("options"));

  var self = app;

  app.initGoogleMaps = function() {
    self.lvm.initGoogleMaps();
  };

  app.selectLocationById = function(locationId) {
    self.lvm.selectLocationById(locationId);
  };


  var isMapInitialized = app.map.initializeMap();
  var d = new Date();
  if (isMapInitialized) {
    app.initGoogleMaps();
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