var app = app || {};
var map;

(function() {
  "use strict";
  var markers = [];
  var activeMarker,
      placeMarkerInfoWindowPrevious;
  var mapController = function() {
    var self = this;
    this.initializeMap = function() {
      var pacDiv = document.getElementById('pac-div');
      if (typeof google === 'object' && typeof google.maps === 'object') {
      	var mapOptions = {
      		center: {lat: 37.795, lng: -122.450},
      		zoom: 13,
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false
      	};
      	map = new google.maps.Map(document.getElementById('map'), mapOptions);

        /* Search Locations From Google Places */
        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(pacDiv);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });
        var placesMarkers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length === 0) {
            return;
          }

          placesMarkers = self.clearPlaceMarkers(placesMarkers);

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            var placeMarker = new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            });

            // Create custom info window for each place
            var button = document.createElement('button');
            button.textContent = "Add to My Places";
            button.addEventListener('click', (function(place) {
              return function() {
                app.lvm.addLocation(place);
              };
            })(place));
            var contentElement = document.createElement('div');
            var header = document.createElement('h4');
            header.textContent = place.name;
            contentElement.appendChild(header);
            contentElement.appendChild(button);
            var placeMarkerInfoWindow = new google.maps.InfoWindow({
              content: contentElement,
              maxWidth: 150
            });
            google.maps.event.addListener(placeMarker, 'click', function(args) {
              if (typeof placeMarkerInfoWindowPrevious === "object") {
                placeMarkerInfoWindowPrevious.close();
              }
              placeMarkerInfoWindow.open(map,placeMarker);
              placeMarkerInfoWindowPrevious = placeMarkerInfoWindow;
            });
            placesMarkers.push(placeMarker);

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
            $("#clear-pac").click(function() {
              self.clearPlaceMarkers(placesMarkers);
              input.textContent = "";
              input.value = "";
            });
          });
          map.fitBounds(bounds);
        });

        // Vanilla JS way to listen for resizing of the window
        // and adjust map bounds
        window.addEventListener('resize', function(e) {
          //Make sure the map bounds get updated on page resize
          map.fitBounds(mapBounds);
        });
        return true;
      }
      else {
        pacDiv.remove();
        app.mvm.addMessage("GoogleMaps","Google Maps not loaded", "alert-danger");
        return false;
      }
    };

    this.clearPlaceMarkers = function(placesMarkers) {
      // Clear out the old Google Places markers.
      placesMarkers.forEach(function(marker) {
        marker.setMap(null);
      });
      placesMarkers = [];
      return placesMarkers;
    };

    this.setMapBounds = function(latlng) {
      if (!window.mapBounds) {
        window.mapBounds = new google.maps.LatLngBounds();
      }
      var bounds = window.mapBounds;
      bounds.extend(latlng);

      // fit the map to the new marker
      map.fitBounds(bounds);
      // center the map
      map.setCenter(bounds.getCenter());
    };

    this.setMapBoundsVisibleMarkers = function() {
      var bounds = new google.maps.LatLngBounds();
      var visibleMarkersCount = 0;
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].getVisible()) {
          visibleMarkersCount += 1;
          bounds.extend(markers[i].getPosition());
        }
      }
      if (visibleMarkersCount === 1) {
        map.setCenter(bounds.getCenter());
      }
      else if (visibleMarkersCount >= 2) {
        map.fitBounds(bounds);
        map.setCenter(bounds.getCenter());
        window.mapBounds = bounds;
      }
    };

    this.createMapMarker = function(location) {
      var lat = location.lat;
      var lng = location.lng;
      var name = location.name;

      var marker = new google.maps.Marker({
        map: map,
        position: {lat: lat, lng: lng},
        title: name
      });

      marker.locationId = location.id;

      // titleWindows are the little helper windows that open when you
      // hover over a pin on a map.
      var titleWindow = new google.maps.InfoWindow({
        content: name,
        maxWidth: 150,
        disableAutoPan: true
      });

      // info is detailed information window for current location
      var info = document.getElementById('info-window');

      marker.showTitleWindow = function() {
        titleWindow.open(map,marker);
      };
      marker.hideTitleWindow = function() {
        titleWindow.close();
      };

      marker.bounce = function() {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
          marker.setAnimation(null);
        },700);
      };

      marker.selectLocation = function() {
        if (typeof activeMarker === "object") {
          activeMarker.setIcon(undefined);
        }
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
        marker.bounce();
        activeMarker = marker;
      };

      google.maps.event.addListener(marker, 'mouseover', function() {
        marker.showTitleWindow();
      });

      google.maps.event.addListener(marker, 'mouseout', function() {
        marker.hideTitleWindow();
      });

      google.maps.event.addListener(marker, 'click', function(args) {
        // Set current location of Location View Model to Marker's location
        app.lvm.selectLocationById(this.locationId);
      });

      self.setMapBounds(new google.maps.LatLng(lat, lng));
      markers.push(marker);

      return marker;
    };

    this.setAllMarkersVisible = function() {
      for (var i = 0; i< markers.length; i++) {
        markers[i].setVisible(true);
      }
    };
    this.setMarkerMap = function(marker, map) {
      marker.setMap(map);
    };
    this.setAllMarkersMap = function(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }
    };
  };
  app.map = new mapController();
})();