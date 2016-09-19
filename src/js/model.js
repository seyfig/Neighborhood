/**
 * Geolocation object
 * @typedef {Object} location
 * @property {lat} Latitude of geolocation
 * @property {lng} Longitude of geolocation
 */

/**
 * Class for storing Types of Places
 * @constructor
 * @property {string} name The name of the type, lower case with _
 * @property {string} text The name of the type, capitalized to display in page
 * @property {string} elem The name of the type, with "filter_" before to give id to html elements
 */
var Type = function(data) {
  this.name = ko.observable(data.name);
  this.text = ko.observable(data.text);
  this.elem = ko.computed(function() {
    return "filter_" + this.name();
  }, this);
};

/**
 * Class for storing Places
 * @constructor
 * @property {number} id, given in sequential order when the page loaded
 added places have new id, the id of removed places will not used again
 * @property {string} name
 * @property {location} geolocation
 * @property {string} address from Google Maps
 * @property {string} street part of address if available
 * @property {string} city part of address if available
 * @property {string} state part of address if available
 * @property {string} country part of address if available
 * @property {number} price_level from Google Maps if available
 * @property {number} rating part of address if available
 * @property {Type[]} types part of address if available
 * @property {string} getTypes get comma separated type names
 * @property {ApiObject} currentApiObject
 * @property {ApiObject[]} getApiObjects returns ApiObjects as a list
 */
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
  /**
   * Enum for request status of APIs.
   * @enum {number}
   * 0 not called
   * 1 waiting call exists
   * 2 received data, don't need to call again
   * 3 no data found, don't need to call again
   */
  this.apiRequestStatus = {};
   /**
   * Enum for request status of APIs.
   * @enum {number}
   * 0 search with name and city
   * 1 search with name
   */
  this.apiSearchStatus = {};
};
/**
 * @method queryObject
 * @param {string} api - API as a string
 * @return {queryObject} returns queryObject to send data to API
 */
Place.prototype.queryObject = function(api) {
  var query = this.name();
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

/**
 * @method toLocatlStorage
 * @return {Object} returns Object to store Place in local storage
 */
Place.prototype.toLocalStorage = function() {
  return {
    name: this.name(),
    types: this.types(),
    geometry: {
      location: this.location()
    },
    formatted_address: this.formatted_address()
  };
};

/**
 * Change selected marker's icon, make the selected marker bounce
 * @method selectMarker
 */
Place.prototype.selectMarker = function() {
  var marker = this.marker;
  if (typeof marker === "undefined") {
    return;
  }
  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    marker.setAnimation(null);
  }, 700);
};

/**
 * Change previously selected marker's icon to normal
 * @method deselectMarker
 */
Place.prototype.deselectMarker = function() {
  var marker = this.marker;
  if (typeof marker === "undefined") {
    return;
  }
  marker.setIcon(undefined);
};

/**
 * Class for storing info Messages
 * @constructor
 * @property {string} component Which application component does the message belong
 * @property {string} text Text of the message
 * @property {string} kind Kind of the message, info, danger, ...
 */
var Message = function(data) {
  this.component = ko.observable(data.component);
  this.text = ko.observable(data.text);
  this.kind = ko.observable(data.kind);
};

/**
 * Class for storing Information gathered from APIs
 * @constructor
 * @property {number} locationId Id of the place object which ApiObject belongs
 * @property {string} description Description text for ApiObject
 * @property {boolean} isDetailLoaded Shows whether the detail information loaded from API
 * @property {boolean} isImagesLoaded Shows whether image URLs loaded from API
 * @property {number} pageId Id of the place object from API
 * @property {string} pageURL url of the site displaying place for the API
 * @property {ApiObjectImage} currentImage Selected ApiObjectImage object
 * @property {string} text Text of ApiObject
 */
var ApiObject = function(data) {
  this.locationId = data.locationId;
  this.description = ko.observable("Loading description");
  this.isDetailLoaded = ko.observable(false);
  this.isImagesLoaded = ko.observable(false);
  this.images = ko.observableArray([]);
  this.imagesAlt = ko.observable("Loading image list");
  this.pageId = data.pageId;
  this.pageURL = ko.observable(data.pageURL);
  this.currentImage = ko.observable(new ApiObjectImage());
  this.text = ko.observable(data.text);
};


/**
 * Class for storing Wikipedia Information
 * @augments ApiObject
 * @constructor
 * @property {string} api API of the ApiObject, Wikipedia
 * @property {string} title Title of the Wikipedia Information
 */

var Wikipedia = function(data) {
  ApiObject.call(this,data);
  this.api = ko.observable("Wikipedia");
  this.title = data.title;
};

Wikipedia.prototype = Object.create(ApiObject.prototype);
Wikipedia.prototype.constructor = Wikipedia;
/**
 * @method selectMarker
 * @param {imageData}
 * @return {WikipediaImage}
 */
Wikipedia.prototype.newImage = function(imageData) {
  return new WikipediaImage(imageData);
};
/**
 * @method queryDetail
 * @return {Object} contains information for API call for detailed information
 */
Wikipedia.prototype.queryDetail = function() {
  return {
    query: this.title,
    locationId: this.locationId,
    api: this.api()
  };
};
/**
 * @method queryImages
 * @return {Object} contains information for API call for images
 */
Wikipedia.prototype.queryImages = function() {
  return {
    query: this.pageId,
    locationId: this.locationId,
    api: this.api()
  };
};

/**
 * Class for storing Foursquare Information
 * @augments ApiObject
 * @constructor
 * @property {string} api API of the ApiObject, Foursquare
 * @property {number} rating Rating information for Foursquare Information
 * @property {string} shortURL short URL of the Foursquare Information
 */
var Foursquare = function(data) {
  ApiObject.call(this,data);
  this.api = ko.observable("Foursquare");
  this.rating = ko.observable(data.rating);
  this.shortURL = ko.observable(data.shortURL);
};

Foursquare.prototype = Object.create(ApiObject.prototype);
Foursquare.prototype.constructor = Foursquare;
/**
 * @method selectMarker
 * @param {imageData}
 * @return {FoursquareImage}
 */
 Foursquare.prototype.newImage = function(imageData) {
  return new FoursquareImage(imageData);
};
/**
 * @method queryDetail
 * @return {Object} contains information for API call for detailed information
 */
Foursquare.prototype.queryDetail = function() {
  return {
    query: this.pageId,
    locationId: this.locationId,
    api: this.api()
  };
};

/**
 * Class for storing Image information from APIs
 * @constructor
 * @property {string} url URL of the image
 * @property {number} descriptionurl URL of the description page
 * @property {string} user Information of the user who shared the image
 * @property {string} localDateString Local date time when the image shared
 */
var ApiObjectImage = function(data) {
  this.url = ko.observable("");
  this.descriptionurl = ko.observable("");
  this.user = ko.observable("");
  this.localDateString = ko.observable("");
};

/**
 * Class for storing Image information from Wikipedia
 * @constructor
 * @property {string} dataurl URL of the Place from Wikipedia
 * @property {string} url URL of the image
 * @property {string} thumburl Thumb URL of the image
 * @property {number} descriptionurl URL of the description page
 * @property {string} user Information of the user who shared the image
 * @property {string} localDateString Local date time when the image shared
 */
var WikipediaImage = function(data) {
  this.dataurl = ko.observable(data.url);
  this.url = ko.observable(data.thumburl);
  this.thumburl = ko.observable(data.thumburl);
  this.descriptionurl = ko.observable(data.descriptionurl);
  this.user = ko.observable(data.user);
  var d = new Date(data.timestamp);
  this.localDateString = ko.observable(d.toLocaleString());
};

/**
 * Class for storing Image information from Wikipedia
 * @constructor
 * @property {number} id Id of Foursquare Image
 * @property {number} height Height of Foursquare Image
 * @property {number} width Width of Foursquare Image
 * @property {string} prefix URL prefix of Foursquare Image
 * @property {string} suffix URL suffix of Foursquare Image
 * @property {string} url URL of the image
 * @property {number} descriptionurl URL of the description page
 * @property {string} user Information of the user who shared the image
 * @property {string} localDateString Local date time when the image shared
 */
var FoursquareImage = function(data) {
  this.id = ko.observable(data.id);
  this.height = ko.observable(data.height);
  this.width = ko.observable(data.width);
  this.prefix = ko.observable(data.prefix);
  this.suffix = ko.observable(data.suffix);
  this.url = ko.computed(function() {
    return this.prefix() +
          this.height() +
          "x" +
          this.width() +
          this.suffix();
  }, this);
  this.descriptionurl = ko.observable(data.descriptionurl);
  var user = data.user.firstName;
  if (data.user.lastName && data.user.lastName.length > 0) {
    user += " " + data.user.lastName[0] + ".";
  }
  this.user = ko.observable(user);
  var d = new Date(0);
  d.setUTCSeconds(data.createdAt);
  this.localDateString = ko.observable(d.toLocaleString());
};