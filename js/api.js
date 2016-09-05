var app = app || {};
"use strict";

(function() {
  // New API's should be added as api constructors
  // and should be added to ApiController.apiList




  // TODO May not used???
  var apiModels = function() {
    self.Wikipedia = function(data) {

    }
  };


  var getFirstChild = function(list) {
    var item;
    for (var index in list) {
      item = list[index];
      break;
    }
    return item;
  };

  var ApiController = function() {
    var self = this;
    this.apiList = ["Wikipedia", "Foursquare"];
    this.apis = {};

    this.ajaxDefaultFailFunction = function(jqxhr, textStatus, error) {
      console.log("TODO");
      console.log("w - error");
      console.log(jqxhr);
      console.log(textStatus);
      console.log(error);
    };

    this.ajaxDefaultSuccessFunction = function(response,a,b,c) {
      console.log("TODO");
      console.log(response);
      console.log(a);
      console.log(b);
      console.log(c);
    };

    this.apiRequest = function(request, queryObject) {
      var api = queryObject.api;
      if (self.apis[api].request[request]) {
        self.apis[api].request[request](queryObject);
      }
    };

    this.apiResponseData = function(apiData) {
      app.lvm.apiResponseData(apiData);
    };

    this.apiResponseFail = function(queryObject) {
      app.lvm.apiResponseFail(queryObject);
    };

    this.apiResponseNoInfo = function(queryObject) {
      app.lvm.apiResponseNoInfo(queryObject);
    };

    this.apiResponseDetail = function(apiData) {
      app.lvm.apiResponseDetail(apiData);
    };

    this.apiResponseImages = function(apiData) {
      app.lvm.apiResponseImages(apiData);
    };

    this.apiResponseDetailFail = function(queryObject) {
      app.lvm.apiResponseDetailFail(queryObject);
    };

    this.apiResponseImagesFail = function(queryObject) {
      app.lvm.apiResponseImagesFail(queryObject);
    };

    // // TODO DELETE
    // this.newApi = function(data) {
    //   this.api = data.api;
    //   this.ajaxFunction = data.ajaxFunction;
    //   this.searchRequestFunction = data.searchRequestFunction;
    //   this.detailRequestFunction = data.detailRequestFunction;
    //   this.imagesRequestFunction = data.imagesRequestFunction;
    // };

   var WikipediaApi = function() {
      var that = this;
      this.api = "Wikipedia";
      this.request = {};
      this.ajax = function(url, successFunction, failFunction) {
        // TODO Request DATA check
        // Other Request functions
        if (!url) {
          console.log("Invalid URL");
        }
        if (!successFunction) {
          successFunction = self.ajaxDefaultSuccessFunction;
        }
        if (!failFunction) {
          failFunction = self.ajaxDefaultFailFunction;
        }
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

      this.request.search = function(queryObject) {
        // TODO try to use models
        //instead of manually checking object properties
        // TODO try to apply checking objects to other methods
        // such as api requests
        if (!(queryObject.query &&
              queryObject.locationId !== undefined)) {
          console.log("invalid request");
          return;
        }
        var query = queryObject.query;
        var locationId = queryObject.locationId;
        var wikipediaURL = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" +
                  query +
                  "&format=json&callback=wikiCallback&redirects=resolve&prop=extracts&exintro=&explaintext=&rvprop=content";
        var failFunction = function() {
          self.apiResponseFail(queryObject);
        }

        var successFunction = function(response) {
          if (response[1][0]) {
            // TODO sync issue
            var wikipediaData = {
              api: that.api,
              locationId: locationId,
              title: response[1][0],
              text: response[2][0],
              pageURL: response[3][0]
            }
            // TODO HERE
            // self is WikiApi, root is ApiController
            // give var name to root, call root
            // apply it to 4sq
            // move 4sq constructor into apicontroller
            self.apiResponseData(wikipediaData);
          }
          else {
            self.apiResponseNoInfo(queryObject);
          }
        }
        that.ajax(wikipediaURL, successFunction, failFunction);
      };
      this.request.query = function(queryObject) {
        var locationId = queryObject.locationId;
        var wikipediaURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&redirects=resolve&prop=extracts&exintro=&explaintext=&titles=" +
                  queryObject.query;
        var failFunction = function() {
          self.apiResponseDetailFail(queryObject);
          self.apiResponseImagesFail(queryObject);
        }

        var successFunction = function(response) {
          res2 = response;
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
        }
        that.ajax(wikipediaURL, successFunction, failFunction);
      };
      this.request.images = function(queryObject) {
        var wikipediaURL = "https://en.wikipedia.org/w/api.php?action=query&pageids=" +
                  queryObject.query +
                  "&generator=images&prop=imageinfo&iiprop=url|dimensions|mime|user|timestamp&format=json&iiurlwidth=800";
        var failFunction = function() {
          self.apiResponseImagesFail(queryObject);
        }
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
        }
        that.ajax(wikipediaURL, successFunction, failFunction);
      }
    };

  var FoursquareApi = function(data) {
      var that = this;
      this.api = "Foursquare";
      this.request = {};
      this.ajax = function(url, successFunction, failFunction) {
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

      this.request.search = function(queryObject) {
        var location = queryObject.location;
        var query = queryObject.query;
        var locationId = queryObject.locationId;
        var locationString = location.lat.toString() +
                            "," +
                            location.lng.toString();
        var url = "https://api.foursquare.com/v2/venues/search?ll=" +
                  locationString +
                  "&limit=1&query=" +
                  query +
                  "&";
        var successFunction = function(response) {
          var venues = response.response.venues;
          if (venues.length > 0) {
            var venueId = response.response.venues[0].id;
            var foursquareData = {
              api: that.api,
              locationId: locationId,
              pageId: venueId
            };
            self.apiResponseData(foursquareData);
          }
          else {
            self.apiResponseNoInfo(queryObject);
          }
        };
        var failFunction = function() {
          self.apiResponseFail(queryObject);
        }
        that.ajax(url, successFunction, failFunction);
      }

      this.request.query = function(queryObject) {
        var url = "https://api.foursquare.com/v2/venues/" +
                  queryObject.query +
                  "?";

        var successFunction = function(response) {
          var venue = response.response.venue;
          var images = venue.photos.groups[0].items;
          for (var i = 0; i < images.length; i++) {
            images[i].descriptionurl = venue.canonicalUrl +
                                    "?openPhotoId=" +
                                    images[i].id;
          }
          var foursquareData = {
            api: that.api,
            locationId: queryObject.locationId,
            pageURL: venue.canonicalUrl,
            description: venue.description,
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
        }

        var failFunction = function() {
          self.apiResponseDetailFail(queryObject);
          self.apiResponseImagesFail(queryObject);
        }
        that.ajax(url, successFunction, failFunction);
      }
    };



    this.apis["Wikipedia"] = new WikipediaApi();
    this.apis["Foursquare"] = new FoursquareApi();
  };
  app.api = new ApiController();
})();