var i = 0;
var logger = function(u) {
	var d = new Date();
	i += 1;
	console.log(i.toString() + " - " + u.toString() + " - " + d.toISOString());
}

mvm = new messageViewModel();
ko.applyBindings(mvm, document.getElementById("messages"));
lvm = new locationViewModel();
mc = new mainController();
ko.applyBindings(lvm, document.getElementById("locations"));
ko.applyBindings(lvm, document.getElementById("wikipediaModal"));
ko.applyBindings(lvm, document.getElementById("options"));
$(function() {
  var isMapInitialized = initializeMap();
  var d = new Date();
  if (isMapInitialized) {
    lvm.initGoogleMaps();
  }


  var closeSideBar = function() {
      $('.sidebar').removeClass('expand').animate({'left': '-240px'},800);
      setTimeout(function() {
        $('.sidebar-hamburger').removeClass('expand');
        //$('.sidebar').animate({'left': '-240px'},200);
      },550)
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

})

