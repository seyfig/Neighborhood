var app = app || {};

(function() {
  "use strict";
  var textFromTypeName = function(typeName) {
    var nameArray = typeName.split('_');
    var textArray = [];
    nameArray.forEach(function(name) {
      textArray.push(name[0].toUpperCase() + name.slice(1));
    });
    return textArray.join(' ');
  };
  /**
   * Class locationViewModel
   * Initialize without Google Maps
   * @constructor
   */
  var locationViewModel = function() {
    var self = this;
    self.isGoogleMapsLoaded = false;
    self.centerOn = ko.observableArray([]);
    self.centerOnList = ko.observableArray(["select","filter"]);
    self.searchText = ko.observable("");
    self.locationIndex = 0;
    self.fullLocationList = ko.observableArray([]);
    self.locationList = ko.observableArray([]);
    self.typeList = ko.observableArray([]);
    self.selectedTypes = ko.observableArray([]);
    self.types = [];
    self.editMode = ko.observable(false);
    self.filterMode = ko.observable(false);
    self.apiMode = ko.observable(false);
    self.optionsMode = ko.observable(false);
    self.locations = {};
    self.apiList = ["Wikipedia", "Foursquare"];
    self.newApiObject = {};
    self.newApiObject.Wikipedia = Wikipedia;
    self.newApiObject.Foursquare = Foursquare;

    /**
     * Add Google Maps Functions
     * @method initGoogleMaps
     */
    self.initGoogleMaps = function() {
      self.isGoogleMapsLoaded = true;
      self.createLocationMarker(self.fullLocationList());
    };
    /**
     * Create marker and, assign location to marker
     * @method createLocationMarker
     */
    self.createLocationMarker = function(locations) {
      if (!self.isGoogleMapsLoaded) {
        return false;
      }
      if (!Array.isArray(locations)) {
        locations = [locations];
      }
      locations.forEach(function(location) {
        var locationData = {
          id: location.id,
          lat: location.location().lat,
          lng: location.location().lng,
          name: location.name()
        };
        location.marker = app.map.createMapMarker(locationData);
        google.maps.event.addListener(location.marker,
                                      "click",
                                      function(args) {
                                        self.selectLocation(location);
                                      });
      });
    };
    /**
     * Applies both search and filter
     * If searchText is empty, don't apply search
     * If all checkboxes or none are clicked, don't apply filter
     * @method filterList
     */
    self.filterList = function() {
      var searchText = self.searchText().trim().toLowerCase();
      var isSearch = false;
      var isFilter = false;
      if (searchText.length > 0) {
        isSearch = true;
      }
      if (self.selectedTypes().length > 0 &&
            self.selectedTypes().length < self.typeList().length) {
        isFilter = true;
      }
      if (!isSearch && !isFilter) {
        self.locationList(self.fullLocationList.slice(0));
        app.map.setAllMarkersVisible();
      }
      else {
        self.locationList.removeAll();
        var fullList = self.fullLocationList();
        fullList.forEach(function(location) {
          var toAdd = true;
          var i = 0;
          if (isSearch) {
            var searchWords = searchText.split(" ");
            var name = location.name().toLowerCase();
            for (i = 0; i < searchWords.length; i++) {
              var searchWord = searchWords[i].trim();
              if (searchWord.length > 0) {
                if (name.indexOf(searchWord) < 0) {
                  toAdd = false;
                  break;
                }
              }
            }
          }
          if (toAdd && isFilter) {
            var type = location.types();
            var typeList = self.selectedTypes();
            var isInList = false;
            for (i = 0; i < typeList.length; i++) {
              if (type.indexOf(typeList[i]) >= 0) {
                isInList = true;
              }
            }
            toAdd = isInList;
          }
          if (toAdd) {
            self.locationList.push(location);
            location.marker.setVisible(true);
          }
          else {
            location.marker.setVisible(false);
          }
        });
      }
      if (self.centerOn.indexOf("filter") >= 0) {
        app.map.setMapBoundsVisibleMarkers();
      }
    };

    self.addTypeFromText = function(typeNames) {
      if (!Array.isArray(typeNames)) {
        typeNames = [typeNames];
      }
      typeNames.forEach(function(typeName) {
        var name = typeName.trim().toLowerCase().replace(/\s/g,'_');
        if(self.types.indexOf(name) < 0) {
          self.types.push(name);
          var type = {
            name: name,
            text: typeName
          };
          self.typeList.push(new Type(type));
        }
      });
    };

    self.addTypeFromName = function(typeNames) {
      if (!Array.isArray(typeNames)) {
        typeNames = [typesNames];
      }
      typeNames.forEach(function(typeName) {
        if(self.types.indexOf(typeName) < 0) {
          self.types.push(typeName);
          var nameArray = typeName.split('_');
          var textArray = [];
          nameArray.forEach(function(name) {
            textArray.push(name[0].toUpperCase() + name.slice(1));
          });
          var text = textArray.join(' ');
          var type = {
            name: typeName,
            text: text
          };
          self.typeList.push(new Type(type));
        }
      });
    };

    self.insertLocation = function(location) {
      location.id = self.locationIndex;
      self.locationIndex += 1;
      self.fullLocationList.push(location);
      self.locations[location.id] = location;
    };

    app.initialLocations.forEach(function(location) {
      self.insertLocation( new Place(location));
      self.addTypeFromText(location.types);
    });
    self.locationList(self.fullLocationList.slice(0));
    self.currentLocation = ko.observable();

    self.save = function() {
      var localLocations = [];
      self.fullLocationList().forEach(function(location) {
        localLocations.push(location.toLocalStorage());
      });
      localStorage.setItem('locations-knockoutjs', JSON.stringify(localLocations));
    };

    self.getLocation = function(locationId) {
      var location = self.locations[locationId];
      if (!location) {
        return;
      }
      else {
        return location;
      }
    };

    self.getApiObject = function(api, locationId) {
      var apiObject = self.locations[locationId].apiObjects()[api]();
      if (!apiObject) {
        return;
      }
      else {
        return apiObject;
      }
    };

    self.addLocation = function(placeData) {
      var place = new Place(placeData);
      place.location({
          lat: place.location().lat(),
          lng: place.location().lng()
        });
      var typeNames = place.types();
      var typeText = [];
      typeNames.forEach(function(typeName) {
        var text = textFromTypeName(typeName);
        typeText.push(text);
      });
      place.types(typeText);
      self.insertLocation(place);
      self.createLocationMarker(place);
      self.addTypeFromName(typeNames);
      self.save();
      self.filterList();
    };

    self.removeLocation = function(location) {
      if (self.currentLocation() === location) {
        self.emptyCurrentLocation();
      }
      self.locations[location.id] = undefined;
      self.fullLocationList.remove(location);
      app.map.setMarkerMap(location.marker, null);
      location.marker = undefined;
      location = undefined;
      self.save();
      self.filterList();
    };

    self.selectLocation = function(location) {
      var currentLocation = self.currentLocation();
      if (typeof currentLocation === "object") {
        currentLocation.deselectMarker();
      }
      self.currentLocation(location);
      if (self.isGoogleMapsLoaded) {
          location.selectMarker();
        if(self.centerOn.indexOf('select') >= 0) {
          map.setCenter(location.marker.getPosition());
        }
      }
      self.apiRequestAll(location);
    };

    self.emptyCurrentLocation = function() {
      self.currentLocation(undefined);
    };

    self.showMarkerTitle = function(location) {
      location.marker.showTitleWindow();
    };
    self.hideMarkerTitle = function(location) {
      location.marker.hideTitleWindow();
    };

    self.search = function() {
      self.filterList();
      return true;
    };

    self.toggleEditMode = function() {
      self.editMode(!self.editMode());
    };

    self.toggleFilterMode = function() {
      self.filterMode(!self.filterMode());
    };

    self.openApiMode = function(apiObject) {
      var locationId = apiObject.locationId;
      var location = self.getLocation(locationId);
      var api = apiObject.api();
      if (!location) {
        return;
      }
      if (!api) {
        return;
      }
      if (!apiObject.isDetailLoaded()){
        self.apiRequestDetail(apiObject.queryDetail());
      }
      else if (!apiObject.isImagesLoaded()) {
        self.apiRequestImages(apiObject.queryImages());
      }
      location.currentApiObject(apiObject);
      self.apiMode(true);
    };

    self.closeApiMode = function() {
      self.apiMode(false);
    };

    self.changeImage = function(apiObject, event) {
      var index = apiObject.images.indexOf(apiObject.currentImage());
      var images = apiObject.images();
      var length = images.length;
      index += length;
      if  (event.delegateTarget.classList.contains("pre-image")) {
        index = (index - 1) % length;
      }
      else {
        index = (index + 1) % length;
      }
      apiObject.currentImage(images[index]);
    };

    self.toggleOptionsMode = function() {
      self.optionsMode(!self.optionsMode());
    };

    self.clickCheckbox = function(option,e) {
      $(e.target).siblings('input').click();
    };

/* ======= API FUNCTIONS START ======= */
    self.apiRequestAll = function(location) {
      var apiCount = self.apiList.length;
      for (var i = 0; i < apiCount; i++) {
        self.apiRequest(self.apiList[i], location);
      }
    };

    /**
     * Searchs location on an API
     * If location found, apiResponseData function called
     to initialize apiObject for that API
     * @method apiRequest
     */
    self.apiRequest = function(api, location) {
      // To search location on an API
      // If location found, apiResponseData function called
      // To initialize apiObject for that API
      if(location.apiRequestStatus[api] === undefined ||
          location.apiRequestStatus[api] === 0) {
        location.apiRequestStatus[api] = 1;
        app.mvm.addMessage(api,
                      "Connecting to " + api,
                      "alert-info",
                      8000);
        var queryObject = location.queryObject(api);
        app.api.apiRequest("search", queryObject);
      }
      else if(location.apiRequestStatus[api] === 1) {
        mvm.addMessage(api,
                      "Call " +
                      api +
                      " for " +
                      location.name() +
                      " on process",
                      "alert-warning",
                      2000);
      }
    };

    /**
     * Initialize apiObject with initial information
     * This initial object may be used to request more information
     * @method apiResponseData
     */
    self.apiResponseData = function(apiData) {
      var api = apiData.api;
      var location = self.getLocation(apiData.locationId);
      if (!location) {
        return;
      }
      var apiObject = ko.observable(new self.newApiObject[api](apiData));
      var apiObjects = location.apiObjects();
      apiObjects[api] = apiObject;
      location.apiObjects(apiObjects);
      location.apiRequestStatus[api] = 2;
    };

    /**
     * When fail to access API
     * @method apiResponseFail
     */
    self.apiResponseFail = function(queryObject) {
      var api = queryObject.api;
      var location = self.getLocation(queryObject.locationId);
      if (!location) {
        return;
      }
      location.apiRequestStatus[api] = 0;
      app.mvm.addMessage(api,
                    "Couldn't connect to " +
                      api +
                      " for now!",
                    "alert-danger",
                    8000);
    };

    /**
     * When no information found with query
     * If search performed with location name and city,
     a new request send with only location name.
     Otherwise, apiRequestStatus for the API set to not found,
     in order to prevent sending new requests for the same apiObject
     * @method apiResponseNoInfo
     */
    self.apiResponseNoInfo = function(queryObject) {
      var api = queryObject.api;
      var location = self.getLocation(queryObject.locationId);
      if (!location) {
        return;
      }
      if (!location.apiSearchStatus[api] || location.apiSearchStatus[api] === 0) {
        location.apiSearchStatus[api] = 1;
        location.apiRequestStatus[api] = 0;
        self.apiRequest(api, location);
      }
      else if (location.apiSearchStatus[api] === 1) {
        location.apiRequestStatus[api] = 3;
      }
      app.mvm.addMessage(api,
                    "No " +
                      api +
                      " Information for " +
                      queryObject.query,
                    "alert-warning",
                    8000);
    };

    self.apiRequestDetail = function(queryObject) {
      app.api.apiRequest("query", queryObject);
    };

    self.apiRequestImages = function(queryObject) {
      app.api.apiRequest("images", queryObject);
    };

    self.apiResponseDetail = function(apiData) {
      var apiObject = self.getApiObject(apiData.api,
                                        apiData.locationId);
      if (!apiObject) {
        return;
      }
      for(var property in apiData) {
        if (typeof apiObject[property] === "function") {
          apiObject[property](apiData[property]);
        }
        else {
          apiObject[property] = apiData[property];
        }
      }
      apiObject.isDetailLoaded(true);
    };

    self.apiResponseImages = function(apiData) {
      var apiObject = self.getApiObject(apiData.api,
                                        apiData.locationId);
      if (!apiObject) {
        return;
      }
      if (apiData.images.length > 0) {
        apiData.images.forEach(function (imageData) {
          apiObject.images.push(apiObject.newImage(imageData));
        });
        apiObject.currentImage(apiObject.images()[0]);
      }
      else {
        apiObject.imagesAlt("No images found on " + apiData.api);
      }
      apiObject.isImagesLoaded(true);
    };

    self.apiResponseDetailFail = function(queryObject) {
      var apiObject = self.getApiObject(queryObject.api,
                                        queryObject.locationId);
      if (!apiObject) {
        return;
      }
      apiObject.description("Description can not be loaded this time.");
    };

    self.apiResponseImagesFail = function(queryObject) {
      var apiObject = self.getApiObject(queryObject.api,
                                        queryObject.locationId);
      if (!apiObject) {
        return;
      }
      apiObject.imagesAlt("Image list can not be loaded this time.");
    };
/* ======= API FUNCTIONS END ======= */

  };
  app.lvm = new locationViewModel();
  if (typeof app.bindLocationsVM === "function") {
    app.bindLocationsVM();
  }
})();