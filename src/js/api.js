var app = app || {};

(function() {
  "use strict";

  var getFirstChild = function(list) {
    var item;
    for (var index in list) {
      item = list[index];
      break;
    }
    return item;
  };
  /**
   * Class ApiController
   * Manages API Requests and Responses
   * New API's should be added as api constructors like WikipediaApi and FoursquareApi
   * The API names should be added to ApiController.apiList, and locationViewModel.apiList
   in location.js file.
   * For returning objects, new objects should be added to model.js like Wikipedia,
   WikipediaImage, and FoursquareImage,
   * @constructor
   */
  var ApiController = function() {
    var self = this;
    self.apiList = ["Wikipedia", "Foursquare"];
    self.apis = {};

    self.apiRequest = function(request, queryObject) {
      var api = queryObject.api;
      if (self.apis[api].request[request]) {
        self.apis[api].request[request](queryObject);
      }
    };

    self.apiResponseData = function(apiData) {
      app.lvm.apiResponseData(apiData);
    };

    self.apiResponseFail = function(queryObject) {
      app.lvm.apiResponseFail(queryObject);
    };

    self.apiResponseNoInfo = function(queryObject) {
      app.lvm.apiResponseNoInfo(queryObject);
    };

    self.apiResponseDetail = function(apiData) {
      app.lvm.apiResponseDetail(apiData);
    };

    self.apiResponseImages = function(apiData) {
      app.lvm.apiResponseImages(apiData);
    };

    self.apiResponseDetailFail = function(queryObject) {
      app.lvm.apiResponseDetailFail(queryObject);
    };

    self.apiResponseImagesFail = function(queryObject) {
      app.lvm.apiResponseImagesFail(queryObject);
    };

   var WikipediaApi = function() {
      var that = this;
      that.api = "Wikipedia";
      that.request = {};
      that.ajax = function(url, successFunction, failFunction) {
        var wikiRequestTimeout = setTimeout(failFunction,8000);
        $.ajax({
          type: "GET",
          url: url,
          dataType: "jsonp"
        })
        .done(function(response) {
          clearTimeout(wikiRequestTimeout);
          successFunction(response);
        })
        .fail(failFunction);
      };

      that.request.search = function(queryObject) {
        var query = encodeURIComponent(queryObject.query).replace(/%20/g,'+');
        var locationId = queryObject.locationId;
        var wikipediaURL = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" +
                  query +
                  "&format=json&callback=wikiCallback&redirects=resolve&prop=extracts&exintro=&explaintext=&rvprop=content";
        var failFunction = function() {
          self.apiResponseFail(queryObject);
        };

        var successFunction = function(response) {
          if (response[1][0]) {
            var wikipediaData = {
              api: that.api,
              locationId: locationId,
              title: response[1][0],
              text: response[2][0],
              pageURL: response[3][0]
            };
            self.apiResponseData(wikipediaData);
          }
          else {
            self.apiResponseNoInfo(queryObject);
          }
        };
        that.ajax(wikipediaURL, successFunction, failFunction);
      };
      that.request.query = function(queryObject) {
        var locationId = queryObject.locationId;
        var query = encodeURIComponent(queryObject.query).replace(/%20/g,'+');
        var wikipediaURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&redirects=resolve&prop=extracts&exintro=&explaintext=&titles=" +
                  query;
        var failFunction = function() {
          self.apiResponseDetailFail(queryObject);
          self.apiResponseImagesFail(queryObject);
        };

        var successFunction = function(response) {
          var pages = response.query.pages;
          var page = getFirstChild(pages);
          var wikipediaData = {
            api: that.api,
            locationId: locationId,
            description: page.extract,
            pageId: page.pageid
          };
          self.apiResponseDetail(wikipediaData);
          queryObject.query = page.pageid;
          that.request.images(queryObject);
        };
        that.ajax(wikipediaURL, successFunction, failFunction);
      };
      that.request.images = function(queryObject) {
        var query = encodeURIComponent(queryObject.query);
        var wikipediaURL = "https://en.wikipedia.org/w/api.php?action=query&pageids=" +
                  query +
                  "&generator=images&prop=imageinfo&iiprop=url|dimensions|mime|user|timestamp&format=json&iiurlwidth=800";
        var failFunction = function() {
          self.apiResponseImagesFail(queryObject);
        };
        var successFunction = function(response) {
          var pages = response.query.pages;
          var images = [];
          for (var index in pages) {
            var page = pages[index];
            if (!page.pageid) {
                var imageinfo = page.imageinfo[0];
                var imageData = {
                  url: imageinfo.url,
                  thumburl: imageinfo.thumburl,
                  descriptionurl: imageinfo.descriptionurl,
                  user: imageinfo.user,
                  timestamp: imageinfo.timestamp,
                };
                images.push(imageData);
            }
          }
          var apiData = {
            api: that.api,
            locationId: queryObject.locationId,
            images: images
          };

          self.apiResponseImages(apiData);
        };
        that.ajax(wikipediaURL, successFunction, failFunction);
      };
    };

  var FoursquareApi = function(data) {
      var that = this;
      that.api = "Foursquare";
      that.request = {};
      that.ajax = function(url, successFunction, failFunction) {
        var clientId = "RKFO2JAPI2Q0TOWDDMZJ3C2R2G3PCPIZ0MAOBDNKECSKRNBD";
        var clientSecret = "EEUKXUDZQ23RTUARN3CRVFA4AXBSJTDNA3BU5UK0OXGNVIUW";
        url += "client_id=" +
                  clientId +
                  "&client_secret=" +
                  clientSecret +
                  "&v=20130815";
        $.ajax({
          type: "GET",
          url: url
        })
        .done(successFunction)
        .fail(failFunction);
      };

      that.request.search = function(queryObject) {
        var location = queryObject.location;
        var query = encodeURIComponent(queryObject.query);
        var locationId = queryObject.locationId;
        var locationString = location.lat.toString() +
                            "," +
                            location.lng.toString();
        var url = "https://api.foursquare.com/v2/venues/search?ll=" +
                  locationString +
                  "&limit=10&query=" +
                  query +
                  "&";
        var successFunction = function(response) {
          var venues = response.response.venues;
          if (venues.length > 0) {
            var venue = response.response.venues[0];
            var foursquareData = {
              api: that.api,
              locationId: locationId,
              pageId: venue.id,
              text: venue.name
            };
            self.apiResponseData(foursquareData);
          }
          else {
            self.apiResponseNoInfo(queryObject);
          }
        };
        var failFunction = function() {
          self.apiResponseFail(queryObject);
        };
        that.ajax(url, successFunction, failFunction);
      };

      that.request.query = function(queryObject) {
        var query = encodeURIComponent(queryObject.query);
        var url = "https://api.foursquare.com/v2/venues/" +
                  query +
                  "?";

        var successFunction = function(response) {
          var venue = response.response.venue;
          var images = venue.photos.groups[0].items;
          for (var i = 0; i < images.length; i++) {
            images[i].descriptionurl = venue.canonicalUrl +
                                    "?openPhotoId=" +
                                    images[i].id;
          }
          var venueDescription = venue.description ? venue.description : venue.name;
          var foursquareData = {
            api: that.api,
            locationId: queryObject.locationId,
            pageURL: venue.canonicalUrl,
            description: venueDescription,
            rating: venue.rating,
            shortURL: venue.shortUrl
          };
          var imagesData = {
            api: that.api,
            locationId: queryObject.locationId,
            images:images
          };
          self.apiResponseDetail(foursquareData);
          self.apiResponseImages(imagesData);
        };

        var failFunction = function() {
          self.apiResponseDetailFail(queryObject);
          self.apiResponseImagesFail(queryObject);
        };
        that.ajax(url, successFunction, failFunction);
      };
    };

    self.apis.Wikipedia = new WikipediaApi();
    self.apis.Foursquare = new FoursquareApi();
  };
  app.api = new ApiController();
})();