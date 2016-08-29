var i = 0;
var logger = function(u) {
	var d = new Date();
	i += 1;
	console.log(i.toString() + " - " + u.toString() + " - " + d.toISOString());
}

mvm = new messageViewModel();
ko.applyBindings(mvm, document.getElementById("messages"));
lvm = new locationViewModel();
logger(1);
ko.applyBindings(lvm, document.getElementById("locations"));
ko.applyBindings(lvm, document.getElementById("wikipediaModal"));
ko.applyBindings(lvm, document.getElementById("options"));
logger(2);
$(function() {
  var isMapInitialized = initializeMap();
  var d = new Date();
  logger(3);
  if (isMapInitialized) {
    lvm.initGoogleMaps();
    logger(4);
  }

})
logger(5);

