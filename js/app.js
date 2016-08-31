// init Data or hard coded
var initialLocations = [
  {
    name: 'Lands End',
    types: ['Park'],
    geometry: {
      location: {
        lat: 37.7848836,
        lng: -122.50751
      }
    },
    formatted_address: '608 Point Lobos Ave, San Francisco, CA 94121, USA'
  },
  {
    name: 'Golden Gate Vista Point',
    types: ['Vista Point'],
    geometry: {
      location: {
        lat: 37.8324413,
        lng: -122.479468
      }
    },
    formatted_address: 'U.S. Highway 101, Sausalito, CA 94965, USA'
  },
  {
    name: 'Lombard Street',
    types: ['Vista Point'],
    geometry: {
      location: {
        lat: 37.802139,
        lng: -122.41874
      }
    },
    formatted_address: 'Lombard St, San Francisco, CA 94133, USA'
  },
  {
    name: 'Golden Gate Park',
    types: ['Park'],
    geometry: {
      location: {
        lat: 37.7694208,
        lng: -122.4862138
      }
    },
    formatted_address: 'JFK Drive and 25th Avenue, San Francisco, CA 94121, USA'
  },
  {
    name: 'Union Square',
    types: ['Vista Point'],
    geometry: {
      location: {
        lat: 37.787994,
        lng: -122.407437
      }
    },
    formatted_address: '333 Post St, San Francisco, CA 94108, USA'
  }
];

var textFromTypeName = function(typeName) {
  var nameArray = typeName.split('_');
  var textArray = [];
  nameArray.forEach(function(name) {
    textArray.push(name[0].toUpperCase() + name.slice(1));
  });
  return textArray.join(' ');
}

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
      location.marker.location = location;
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

  this.selectLocation = function(location,event) {
    self.currentLocation(location);
    if (self.isGoogleMapsLoaded) {
      location.marker.selectLocation();
      if(self.centerOn.indexOf('select') >= 0) {
        map.setCenter(location.marker.getPosition());
      }
    }
    self.searchWikipedia(location);
  };

  this.emptyCurrentLocation = function() {
    console.log("panel close clicked");
    self.currentLocation(undefined);
  };

  this.searchWikipedia = function(location) {
    //Wikipedia Information
    if(location.wikipediaStatus === 0) {
      location.wikipediaStatus = 1;
      mvm.addMessage("Wikipedia", "Connecting to Wikipedia", "alert-info", 8000);
      wikipediaSearchRequest(location.wikipediaQuery(), location.id);
    }
    else if (location.wikipediaStatus === 1) {
      mvm.addMessage("Wikipedia",
                    "Call for " + location.name() + " on process",
                    "alert-warning",
                    2000);
    }
  }

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

  this.addWikipedia = function(wikipediaData) {
    console.dir(wikipediaData);
    console.log(wikipediaData);
    var locationId = wikipediaData.locationId;
    var location = self.locations[locationId];
    var wikipedia = new Wikipedia(wikipediaData);
    location.wikipedia(wikipedia);
    location.wikipediaStatus = 2;
  };

  this.addWikipediaFail = function(locationId) {
    var location = self.locations[locationId];
    location.wikipediaStatus = 0;
    mvm.addMessage("Wikipedia","Couldn't connect to Wikipedia for now!", "alert-danger", 8000);
  };

  this.addWikipediaNoInfo = function(locationId) {
    var location = self.locations[locationId];
    if (location.wikipediaSearchStatus() === 0) {
      location.wikipediaSearchStatus(1);
      location.wikipediaStatus = 0;
      self.searchWikipedia(location);
    }
    else if (location.wikipediaSearchStatus() === 1) {
      location.wikipediaStatus = 3;
    }
    mvm.addMessage("Wikipedia",
                  "No Wikipedia Information for " + location.wikipediaQuery(),
                  "alert-warning",
                  8000);
  };

  this.openWikipediaMode = function() {
    var location = self.currentLocation();
    var wikipedia = location.wikipedia();
    if (!wikipedia.isDetailLoaded()){
      wikipediaQueryRequest(wikipedia.title, location.id);
    }
    else if (!wikipedia.isImagesLoaded()) {
      wikipediaImagesRequest(wikipedia.pageid, location.id);
    }
    self.wikipediaMode(true);
  };

  this.closeWikipediaMode = function() {
    self.wikipediaMode(false);
  }

  this.addWikipediaDetail = function(wikipediaData) {
    var locationId = wikipediaData.locationId;
    var location = self.locations[locationId];
    var wikipedia = location.wikipedia();
    wikipedia.longText(wikipediaData.longText);
    wikipedia.pageid = wikipediaData.pageid;
    wikipedia.isDetailLoaded(true);
  };

  this.addWikipediaDetailFail = function() {
    var wikipedia = self.currentLocation().wikipedia();
    wikipedia.longText("Detail text can not be loaded this time.")
  }

  this.addWikipediaImages = function(images, locationId) {
    var location = self.locations[locationId];
    var wikipedia = location.wikipedia();
    images.forEach(function(imageData) {
      wikipedia.images.push(new WikipediaImage(imageData));
    });
    wikipedia.currentImage(wikipedia.images()[0]);
    wikipedia.isImagesLoaded(true);
  };

  this.changeImage = function(wikipedia ,event) {
    var index = wikipedia.images.indexOf(wikipedia.currentImage());
    var images = wikipedia.images();
    var length = images.length;
    if  (event.toElement.classList.contains("pre-image")) {
      index = (index - 1) % length;
    }
    else {
      index = (index + 1) % length;
    }
    wikipedia.currentImage(images[index]);
  };

  this.toggleOptionsMode = function() {
    self.optionsMode(!self.optionsMode());
  };

  this.clickCheckbox = function(option,e) {
    $(e.target).siblings('input').click()
  };
}