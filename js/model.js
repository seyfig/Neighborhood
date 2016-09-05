"use strict";

var Type = function(data) {
  this.name = ko.observable(data.name);
  this.text = ko.observable(data.text);
  this.elem = ko.computed(function() {
    return "filter_" + this.name();
  }, this);
};

var Place = function(data) {
  this.id = data.id;
  this.name = ko.observable(data.name);
  this.location = ko.observable(data.geometry.location);
  this.formatted_address = ko.observable(data.formatted_address);
  var isAddressParsable = false;
  if (data.formatted_address) {
    var address = data.formatted_address.split(',');
    if (address.length === 3) {
      address.unshift("");
    }
    if (address.length === 4) {
      isAddressParsable = true;
      this.street = ko.observable(address[0].trim());
      this.city = ko.observable(address[1].trim());
      this.state = ko.observable(address[2].trim());
      this.country = ko.observable(address[3].trim());
    }
  }
  if (!isAddressParsable) {
    this.street = ko.observable("");
    this.city = ko.observable("");
    this.state = ko.observable("");
    this.country = ko.observable("");
  }
  this.price_level = ko.observable(data.price_level);
  this.rating = ko.observable(data.rating);
  this.types = ko.observableArray(data.types);
  this.getTypes = ko.computed(function() {
    return this.types().join(", ");
  }, this);

  this.currentApiObject = ko.observable();
  this.apiObjects = ko.observable({});
  this.getApiObjects = ko.computed(function() {
    var apiObjects = this.apiObjects();
    var apiObjectList = [];
    for (var i in apiObjects) {
      apiObjectList.push(apiObjects[i]);
    }
    return apiObjectList;
  },this);
  this.apiRequestStatus = {};
  // TODO REFACTOR
  // 0 not called
  // 1 waiting call exists
  // 2 received data, don't need to call again
  // 3 no data found, don't need to call again
  this.apiSearchStatus = {};
  // TODO REFACTOR
  // 0 search with name and city
  // 1 search with name
  this.queryObject = function(api) {
    var query = this.name();
    // TODO
    // TODOF how is it possible without following line
    //if (api === "Wikipedia") {
    if (api && !this.apiSearchStatus[api]) {
      query += " " + this.city();
    }
    var queryObject = {
      api: api,
      locationId: this.id,
      location: this.location(),
      name: this.name(),
      city: this.city(),
      query: query
    };
    return queryObject;
  };
  this.toLocalStorage = function() {
    return {
      name: this.name(),
      types: this.types(),
      geometry: {
        location: this.location()
      },
      formatted_address: this.formatted_address()
    };
  }
};

var Message = function(data) {
  this.component = ko.observable(data.component);
  this.text = ko.observable(data.text);
  this.kind = ko.observable(data.kind);
};

// TODO INHERITANCE NOT WORKED
// not used for now
var apiObject = function(data) {
  this.locationId = data.locationId,
  this.description = ko.observable("Loading description");
  this.isDetailLoaded = ko.observable(false);
  this.isImagesLoaded = ko.observable(false);
  this.images = ko.observableArray([]);
  this.imagesAlt = ko.observable("Loading image list");
  this.pageId = data.pageId;
  this.pageURL = ko.observable(data.pageURL);
  this.currentImage = ko.observable(new ApiObjectImage());
};

var Wikipedia = function(data) {
  this.locationId = data.locationId,
  this.description = ko.observable("Loading description");
  this.isDetailLoaded = ko.observable(false);
  this.isImagesLoaded = ko.observable(false);
  this.images = ko.observableArray([]);
  this.imagesAlt = ko.observable("Loading image list");
  this.pageId = data.pageId;
  this.pageURL = ko.observable(data.pageURL);
  this.currentImage = ko.observable(new ApiObjectImage());
  this.api = ko.observable("Wikipedia");
  this.text = ko.observable(data.text);
  this.title = data.title;
  this.newImage = function(imageData) {
    return new WikipediaImage(imageData);
  };
  this.queryDetail = function() {
    return {
      query: this.title,
      locationId: this.locationId,
      api: this.api()
    };
  };
  this.queryImages = function() {
    return {
      query: this.pageId,
      locationId: this.locationId,
      api: this.api()
    };
  }
}

var Foursquare = function(data) {
  this.locationId = data.locationId,
  this.description = ko.observable("Loading description");
  this.isDetailLoaded = ko.observable(false);
  this.isImagesLoaded = ko.observable(false);
  this.images = ko.observableArray([]);
  this.imagesAlt = ko.observable("Loading image list");
  this.pageId = data.pageId;
  this.pageURL = ko.observable(data.pageURL);
  this.currentImage = ko.observable(new ApiObjectImage());
  this.api = ko.observable("Foursquare");
  this.rating = ko.observable(data.rating);
  this.shortURL = ko.observable(data.shortURL);
  this.text = ko.observable("Foursquare");
  this.newImage = function(imageData) {
    return new FoursquareImage(imageData);
  };
  this.queryDetail = function() {
    return {
      query: this.pageId,
      locationId: this.locationId,
      api: this.api()
    };
  };
}

var ApiObjectImage = function(data) {
  this.url = ko.observable("");
  this.descriptionurl = ko.observable("");
  this.user = ko.observable("");
  this.localDateString = ko.observable("");
}

var WikipediaImage = function(data) {
  this.dataurl = ko.observable(data.url);
  this.url = ko.observable(data.thumburl);
  this.thumburl = ko.observable(data.thumburl);
  this.descriptionurl = ko.observable(data.descriptionurl);
  this.user = ko.observable(data.user);
  var d = new Date(data.timestamp);
  this.localDateString = ko.observable(d.toLocaleString());
};

var FoursquareImage = function(data) {
  this.id = ko.observable(data.id);
  this.height = ko.observable(data.height);
  this.prefix = ko.observable(data.prefix);
  this.suffix = ko.observable(data.suffix);
  var user = data.user.firstName;
  if (data.user.lastName && data.user.lastName.length > 0) {
    user += " " + data.user.lastName[0] + ".";
  }
  this.user = ko.observable(user);
  this.width = ko.observable(data.width);
  var d = new Date(0);
  d.setUTCSeconds(data.createdAt);
  this.localDateString = ko.observable(d.toLocaleString());
  this.descriptionurl = ko.observable(data.descriptionurl);
  this.url = ko.computed(function() {
    return this.prefix() +
          this.height() +
          "x" +
          this.width() +
          this.suffix();
  }, this);
};