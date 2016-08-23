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
    formatted_address: '608 Point Lobos Ave, San Francisco, CA 94121'
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
    formatted_address: 'U.S. Highway 101, Sausalito, CA 94965'
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
    formatted_address: 'Lombard St, San Francisco, CA 94133'
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
    formatted_address: 'JFK Drive and 25th Avenue, San Francisco, CA 94121'
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
    formatted_address: '333 Post St, San Francisco, CA 94108'
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

var Type = function(data) {
  this.name = ko.observable(data.name);
  this.text = ko.observable(data.text);
  this.elem = ko.computed(function() {
    return "filter_" + this.name();
  }, this);
};

var Place = function(data) {
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.geometry.location);
  this.formatted_address = ko.observable(data.formatted_address);
  this.price_level = ko.observable(data.price_level);
  this.rating = ko.observable(data.rating);
  this.types = ko.observableArray(data.types);
  this.getTypes = ko.computed(function() {
    return this.types().join(", ");
  }, this);
};

var Message = function(data) {
  this.text = ko.observable(data.text);
  this.kind = ko.observable(data.kind);
};

var messageViewModel = function() {
  var self = this;
  self.messageList = ko.observableArray([]);
  self.addMessage = function(message, kind) {
    self.messageList.push( new Message({
      text: message,
      kind: kind
    }));
  }
};

var locationViewModel = function() {
  var self = this;
  this.centerOn = ko.observableArray([]);
  this.searchText = ko.observable("");
  this.fullLocationList = ko.observableArray([]);
  this.locationList = ko.observableArray([]);
  this.typeList = ko.observableArray([]);
  this.selectedTypes = ko.observableArray([]);
  this.types = [];
  this.editMode = ko.observable(false);

  // Create marker and, assign location to marker
  this.createLocationMarker = function(locations) {
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

  initialLocations.forEach(function(location) {
    self.fullLocationList.push( new Place(location));
    self.addTypeFromText(location.types);
  });
  self.createLocationMarker(self.fullLocationList());
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
    self.fullLocationList.push(place);
    self.createLocationMarker(place);
    self.addTypeFromName(typeNames);
    self.save();
    self.filterList();
  }

  this.removeLocation = function(location) {
    self.fullLocationList.remove(location);
    setMarkerMap(location.marker, null);
    location.marker = undefined;
    location = undefined;
    self.save();
    self.filterList();
  }

  this.selectLocation = function(location,event) {
    self.currentLocation(location);
    location.marker.selectLocation();
    if(self.centerOn.indexOf('select') >= 0) {
      map.setCenter(location.marker.getPosition());
    }
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
  }

  this.toggleEditMode = function() {
    self.editMode(!self.editMode());
  }
}

$(function() {
  mvm = new messageViewModel();
  ko.applyBindings(mvm, document.getElementById("messages"));
  var isMapInitialized = initializeMap();
  if (isMapInitialized) {
    lvm = new locationViewModel();
    ko.applyBindings(lvm, document.getElementById("locations"));
  }
})
