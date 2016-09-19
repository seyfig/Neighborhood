var app = app || {};
var map;

(function() {
  "use strict";
  var markers = [];
  var placeMarkerInfoWindowPrevious;
  /**
   * Class mapController
   * @constructor
   */
  var mapController = function() {
    var self = this;
    self.pacDiv = document.getElementById('pac-div');
    /**
     * Search Locations from Google Places
     * Create the search box and link it to the UI element
     * @method initializeGoogleSearch
     */
    self.initializeGoogleSearch = function() {
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(self.pacDiv);

      /**
       * @function Map Listener bounds_changed
       * Bias the SearchBox results towards current map's viewport.
       */
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });
      var placesMarkers = [];

      /**
       * @function Map Listener places_changed
       * Listen for the event fired when the user selects a prediction and retrieve
       more details for that place.
       * For each place, get the icon, name and location,
       and create a marker and a custom info window
       */
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length === 0) {
          return;
        }

        placesMarkers = self.clearPlaceMarkers(placesMarkers);
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            return;
          }
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          var placeMarker = new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          });

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

    };
    self.initializeMap = function() {
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

        self.initializeGoogleSearch();
        /**
         * @function Window Event Listener resize
         * Vanilla JS way to listen for resizing of the window and adjust map bounds
         * Make sure the map bounds get updated on page resize
         */
        window.addEventListener('resize', function(e) {
          map.fitBounds(mapBounds);
        });
        app.lvm.initGoogleMaps();
        return true;
      }
      else {
        self.googleError();
        return false;
      }
    };
    self.googleError = function() {
      self.pacDiv.remove();
      delete self.pacDiv;
      app.mvm.addMessage("GoogleMaps","Google Maps not loaded", "alert-danger");
    };

    /**
     * Clear out the old Google Places markers.
     * @method clearPlaceMarkers
     */
    self.clearPlaceMarkers = function(placesMarkers) {
      placesMarkers.forEach(function(marker) {
        marker.setMap(null);
      });
      placesMarkers = [];
      return placesMarkers;
    };

    /**
     * When a new marker added extend map bounds
     * Fit bounds of the map to the new marker
     * Center the map
     * @method setMapBounds
     * @param {location} latlng Latitude and Longitude of added marker
     */
    self.setMapBounds = function(latlng) {
      if (!window.mapBounds) {
        window.mapBounds = new google.maps.LatLngBounds();
      }
      var bounds = window.mapBounds;
      bounds.extend(latlng);

      map.fitBounds(bounds);
      map.setCenter(bounds.getCenter());
    };

    self.setMapBoundsVisibleMarkers = function() {
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

    /**
     * Adds marker to the for a location
     * titleWindows are the little helper windows that open when hover over a pin on a map.
     * info is detailed information window for current location
     * @method createMapMarker
     * @param {object} location
     * @param {number} location.lat Latitude of location
     * @param {number} location.lng Longitude of location
     * @param {string} location.name Name of location
     */
    self.createMapMarker = function(location) {
      var lat = location.lat;
      var lng = location.lng;
      var name = location.name;

      var marker = new google.maps.Marker({
        map: map,
        position: {lat: lat, lng: lng},
        title: name
      });

      marker.locationId = location.id;
      var titleWindow = new google.maps.InfoWindow({
        content: name,
        maxWidth: 150,
        disableAutoPan: true
      });

      var info = document.getElementById('info-window');

      marker.showTitleWindow = function() {
        titleWindow.open(map,marker);
      };
      marker.hideTitleWindow = function() {
        titleWindow.close();
      };

      google.maps.event.addListener(marker, 'mouseover', function() {
        marker.showTitleWindow();
      });

      google.maps.event.addListener(marker, 'mouseout', function() {
        marker.hideTitleWindow();
      });

      self.setMapBounds(new google.maps.LatLng(lat, lng));
      markers.push(marker);

      return marker;
    };

    self.setAllMarkersVisible = function() {
      for (var i = 0; i< markers.length; i++) {
        markers[i].setVisible(true);
      }
    };
    self.setMarkerMap = function(marker, map) {
      marker.setMap(map);
    };
    self.setAllMarkersMap = function(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }
    };
  };
  app.map = new mapController();
})();

var initMap = function() {
  app.map.initializeMap();
};

var googleError = function() {
  app.map.googleError();
};