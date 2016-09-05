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

(function() {
  var locationViewModel = function() {
    // Initialize without Google Maps
    var self = this;
    this.isGoogleMapsLoaded = false;
    this.centerOn = ko.observableArray([]);
    this.centerOnList = ko.observableArray(["select","filter"]);
    this.searchText = ko.observable("");
    this.locationIndex = 0;
    this.fullLocationList = ko.observableArray([]);
    this.locationList = ko.observableArray([]);
    this.typeList = ko.observableArray([]);
    this.selectedTypes = ko.observableArray([]);
    this.types = [];
    this.editMode = ko.observable(false);
    this.filterMode = ko.observable(false);
    this.wikipediaMode = ko.observable(false);
    this.apiMode = ko.observable(false);
    this.optionsMode = ko.observable(false);
    this.locations = {};

    // Add Google Maps Functions
    this.initGoogleMaps = function() {
      this.isGoogleMapsLoaded = true;
      self.createLocationMarker(self.fullLocationList());
    }

    // Create marker and, assign location to marker
    this.createLocationMarker = function(locations) {
      if (!self.isGoogleMapsLoaded) {
        return false;
      }
      if (!Array.isArray(locations)) {
        locations = [locations];
      }
      locations.forEach(function(location) {
        var locationData = {
          lat: location.location().lat,
          lng: location.location().lng,
          name: location.name()
        };
        location.marker = createMapMarker(locationData);
        location.marker.locationId = location.id;
      });
    };

    // Apply both search and filter
    this.filterList = function() {
      var searchText = self.searchText().trim().toLowerCase();
      var isSearch = false;
      var isFilter = false;
      //If searhText is empty, don't apply search
      if (searchText.length > 0) {
        isSearch = true;
      }
      //If all checkboxes or none are clicked, don't apply filter
      if (self.selectedTypes().length > 0 &&
            self.selectedTypes().length < self.typeList().length) {
        isFilter = true;
      }
      if (!isSearch && !isFilter) {
        self.locationList(self.fullLocationList.slice(0));
        setAllMarkersVisible();
      }
      else {
        self.locationList.removeAll();
        var fullList = self.fullLocationList();
        fullList.forEach(function(location) {
          var toAdd = true;
          if (isSearch) {
            var searchWords = searchText.split(" ");
            var name = location.name().toLowerCase();
            for (var i = 0; i < searchWords.length; i++) {
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
            for (var i = 0; i < typeList.length; i++) {
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
        setMapBoundsVisibleMarkers();
      }
    };

    this.addTypeFromText = function(typeNames) {
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
      })
    };

    this.addTypeFromName = function(typeNames) {
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

    this.insertLocation = function(location) {
      location.id = self.locationIndex;
      self.locationIndex += 1;
      self.fullLocationList.push(location);
      self.locations[location.id] = location;
    };

    initialLocations.forEach(function(location) {
      self.insertLocation( new Place(location));
      self.addTypeFromText(location.types);
    });
    self.locationList(self.fullLocationList.slice(0));
    self.currentLocation = ko.observable();

    // Data persistence
    // TODO
    this.save = function() {
      console.log(self);
    };

    this.getLocation = function(locationId) {
      return self.locations[locationId];
    };

    this.getApiObject = function(api, locationId) {
      return self.locations[locationId].apiObjects()[api]();
    }

    this.addLocation = function(placeData) {
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
    }

    this.removeLocation = function(location) {
      self.locations[location.id] = undefined;
      self.fullLocationList.remove(location);
      setMarkerMap(location.marker, null);
      location.marker = undefined;
      location = undefined;
      self.save();
      self.filterList();
    }

    this.selectLocation = function(location) {
      self.currentLocation(location);
      if (self.isGoogleMapsLoaded) {
        location.marker.selectLocation();
        if(self.centerOn.indexOf('select') >= 0) {
          map.setCenter(location.marker.getPosition());
        }
      }
      mc.apiRequestAll(location);
    };

    this.selectLocationById = function(locationId) {
      var location = self.getLocation(locationId);
      self.selectLocation(location);
    }

    this.emptyCurrentLocation = function() {
      self.currentLocation(undefined);
    };

    this.showMarkerTitle = function(location) {
      location.marker.showTitleWindow();
    };
    this.hideMarkerTitle = function(location) {
      location.marker.hideTitleWindow();
    };

    this.search = function() {
      self.filterList();
      return true;
    };

    this.toggleEditMode = function() {
      self.editMode(!self.editMode());
    };

    this.toggleFilterMode = function() {
      self.filterMode(!self.filterMode());
    };

    this.openApiMode = function(apiObject) {
      var locationId = apiObject.locationId;
      var location = self.getLocation(locationId);
      var api = apiObject.api();
      if (!apiObject.isDetailLoaded()){
        mc.apiRequestDetail(api, apiObject.queryDetail(), locationId);
      }
      else if (!apiObject.isImagesLoaded()) {
        mc.apiRequestImages(api, apiObject.queryImages(), locationId);
      }
      location.currentApiObject(apiObject);
      self.apiMode(true);
    };

    this.closeApiMode = function() {
      self.apiMode(false);
    }

    // TODO MOVE TO MAINCONTROLLER
    this.addResponseFail = function(api, locationId) {
      var location = self.getLocation(locationId);
      location.apiRequestStatus[api] = 0;
      mvm.addMessage(api,
                    "Couldn't connect to " +
                      api +
                      " for now!",
                    "alert-danger",
                    8000);
    };

    // TODO MOVE TO MAINCONTROLLER
    this.addResponseNoInfo = function(api, locationId, query) {
      var location = self.getLocation(locationId);
      if (!location.apiSearchStatus[api] || location.apiSearchStatus[api] === 0) {
        location.apiSearchStatus[api] = 1;
        location.apiRequestStatus[api] = 0;
        mc.apiRequest(api, location);
      }
      else if (location.apiSearchStatus[api] === 1) {
        location.apiRequestStatus[api] = 3;
      }
      mvm.addMessage(api,
                    "No " +
                      api +
                      " Information for " +
                      query,
                    "alert-warning",
                    8000);
    };

    // TODO MOVE TO MAINCONTROLLER
    this.addResponseDetailFail = function(api, locationId) {
      self.getApiObject(api, locationId).
        description("Description can not be loaded this time.");
    };

    this.addResponseImagesFail = function(api, locationId) {
      self.getApiObject(api, locationId).
        imagesAlt("Image list can not be loaded this time.");
    };

    this.changeImage = function(apiObject, event) {
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



    this.toggleOptionsMode = function() {
      self.optionsMode(!self.optionsMode());
    };

    this.clickCheckbox = function(option,e) {
      $(e.target).siblings('input').click()
    };
  }
})();