var mainController = function() {
  var self = this;
  this.apis = ["Wikipedia", "Foursquare"];
  this.newApiObject = {};
  this.apiSearchRequest = {};
  this.apiDetailRequest = {};
  this.apiImagesRequest = {};
  this.apiSearchRequest["Wikipedia"] = wikipediaSearchRequest;
  this.apiSearchRequest["Foursquare"] = foursquareSearchRequest;
  this.apiDetailRequest["Wikipedia"] = wikipediaQueryRequest;
  this.apiDetailRequest["Foursquare"] = foursquareQueryRequest;
  this.apiImagesRequest["Wikipedia"] = wikipediaImagesRequest;


  this.apiRequestAll = function(location) {
    for (var i = 0; i < self.apis.length; i++) {
      self.apiRequest(self.apis[i], location);
    }
  };

  this.apiRequest = function(api, location) {
    if(location.apiRequestStatus[api] === undefined ||
        location.apiRequestStatus[api] === 0) {
      location.apiRequestStatus[api] = 1;
      mvm.addMessage(api,
                    "Connecting to " + api,
                    "alert-info",
                    8000);
      var queryObject = location.queryObject(api);
      self.apiSearchRequest[api](queryObject);
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

  this.apiRequestDetail = function(api, query, locationId) {
    if (self.apiDetailRequest[api] !== undefined) {
      self.apiDetailRequest[api](query, locationId);
    }
  };

  this.apiRequestImages = function(api, query, locationId) {
    if (self.apiImagesRequest[api] !== undefined) {
      self.apiImagesRequest[api](query, locationId);
    }
  }

  this.addResponseData = function(api, apiData) {
    var locationId = apiData.locationId;
    var location = lvm.getLocation(locationId);
    var apiObject = ko.observable(new self.newApiObject[api](apiData));
    var apiObjects = location.apiObjects();
    apiObjects[api] = apiObject;
    location.apiObjects(apiObjects);
    location.apiRequestStatus[api] = 2;
  };

  this.addResponseDetail = function(api, apiData) {
    var locationId = apiData.locationId;
    var location = lvm.getLocation(locationId);
    var apiObject = location.apiObjects()[api]();
    for(var property in apiData) {
      if (typeof apiObject[property] === "function") {
        apiObject[property](apiData[property]);
      }
      else {
        apiObject[property] = apiData[property];
      }
    }
    apiObject.isDetailLoaded(true);
  }

  this.addResponseImages = function(api, images, locationId) {
    var location = lvm.getLocation(locationId);
    var apiObject = location.apiObjects()[api]();
    images.forEach(function (imageData) {
      apiObject.images.push(apiObject.newImage(imageData));
    });
    apiObject.currentImage(apiObject.images()[0]);
    apiObject.isImagesLoaded(true);
  }

};