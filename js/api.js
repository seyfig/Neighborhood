var getFirstChild = function(list) {
  var item;
  for (var index in list) {
    item = list[index];
    break;
  }
  return item;
}

var wikipediaRequest = function(url, successFunction, failFunction) {
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
}
var apiSuccessFunction = function(response,a,b,c) {
    console.log(response);
    console.log(a);
    console.log(b);
    console.log(c);
  };

var apiFailFunction = function(jqxhr, textStatus, error) {
      console.log("w - error");
      console.log(jqxhr);
      console.log(textStatus);
      console.log(error);
};

var wikipediaSearchRequest = function(queryObject) {
  var query = queryObject.query;
  var locationId = queryObject.locationId;
  var wikipediaURL = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" +
            query +
            "&format=json&callback=wikiCallback&redirects=resolve&prop=extracts&exintro=&explaintext=&rvprop=content";
  var failFunction = function() {
    lvm.addResponseFail("Wikipedia",locationId);
  }

  var successFunction = function(response) {
    if (response[1][0]) {
      // TODO sync issue
      var wikipediaData = {
        locationId: locationId,
        title: response[1][0],
        text: response[2][0],
        pageURL: response[3][0]
      }
      mc.addResponseData("Wikipedia", wikipediaData);
    }
    else {
      lvm.addResponseNoInfo("Wikipedia", locationId, query);
    }
  }

  wikipediaRequest(wikipediaURL, successFunction, failFunction);
}

var wikipediaQueryRequest = function(query, locationId) {
  var wikipediaURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&redirects=resolve&prop=extracts&exintro=&explaintext=&titles=" +
            query;
  var failFunction = function() {
    lvm.addResponseDetailFail("Wikipedia", locationId);
    lvm.addResponseImagesFail("Wikipedia", locationId);
  }

  var successFunction = function(response) {
    res2 = response;
    var pages = response.query.pages;
    var page = getFirstChild(pages);
    var wikipediaData = {
      locationId: locationId,
      description: page.extract,
      pageId: page.pageid
    };
    mc.addResponseDetail("Wikipedia", wikipediaData);
    wikipediaImagesRequest(page.pageid, locationId);
  }
  wikipediaRequest(wikipediaURL, successFunction, failFunction);
}

var wikipediaImagesRequest = function(query, locationId) {
  var wikipediaURL = "https://en.wikipedia.org/w/api.php?action=query&pageids=" +
            query +
            "&generator=images&prop=imageinfo&iiprop=url|dimensions|mime|user|timestamp&format=json&iiurlwidth=800";
  var failFunction = function() {
    lvm.addResponseImagesFail("Wikipedia", locationId);
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
    mc.addResponseImages("Wikipedia", images, locationId);
  }
  wikipediaRequest(wikipediaURL, successFunction, failFunction);
}

/* ======= FOURSQUARE ======= */

var foursquareRequest = function(url, successFunction, failFunction) {
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
}


var foursquareSearchRequest = function(queryObject) {
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
    var venueId = response.response.venues[0].id;
    var foursquareData = {
      locationId: locationId,
      pageId: venueId
    };
    mc.addResponseData("Foursquare", foursquareData);
  };
  var failFunction = function() {
    lvm.addResponseFail("Foursquare",locationId);
  }
  foursquareRequest(url, successFunction, failFunction);
}

var foursquareQueryRequest = function(venueId, locationId) {
  var url = "https://api.foursquare.com/v2/venues/" +
            venueId +
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
      locationId: locationId,
      pageURL: venue.canonicalUrl,
      description: venue.description,
      rating: venue.rating,
      shortURL: venue.shortUrl
    };
    mc.addResponseDetail("Foursquare", foursquareData);
    mc.addResponseImages("Foursquare", images, locationId);
  }

  var failFunction = function() {
    lvm.addResponseDetailFail("Foursquare", locationId);
    lvm.addResponseImagesFail("Foursquare", locationId);
  }
  foursquareRequest(url, successFunction, failFunction);
}
