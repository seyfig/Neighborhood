var getFirstChild = function(list) {
  var item;
  for (var index in list) {
    item = list[index];
    break;
  }
  return item;
}

var wikipediaRequest = function(url, timeoutFunction, successFunction, failFunction) {
  var wikiRequestTimeout = setTimeout(timeoutFunction,2000);
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

var apiFailFunction = function(jqxhr, textStatus, error) {
      console.log("w - error");
      console.log(jqxhr);
      console.log(textStatus);
      console.log(error);
}

var wikipediaSearchRequest = function(query) {
  var wikipediaURL = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" +
            query +
            "&format=json&callback=wikiCallback&redirects=resolve&prop=extracts&exintro=&explaintext=&rvprop=content";
  var timeoutFunction = function() {
    console.log('failed to get wikipedia resources');
  }

  var successFunction = function(response) {
    if (response[1][0]) {
      // TODO sync issue
      var wikipediaData = {
        title: response[1][0],
        text: response[2][0]
      }
      lvm.addWikipedia(wikipediaData);
    }
    else {
      console.log("No info found in Wikipedia");
    }
  }

  wikipediaRequest(wikipediaURL, timeoutFunction, successFunction, apiFailFunction);
}

var wikipediaQueryRequest = function(query) {
  var wikipediaURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&redirects=resolve&prop=extracts&exintro=&explaintext=&titles=" +
            query;
  var timeoutFunction = function() {
    console.log('failed to get wikipedia content');
  }

  var successFunction = function(response) {
    res2 = response;
    var pages = response.query.pages;
    var page = getFirstChild(pages);
    var wikipediaData = {
      longText: page.extract,
      pageid: page.pageid
    };
    lvm.addWikipediaDetail(wikipediaData);
    wikipediaImagesRequest(page.pageid);
  }

  wikipediaRequest(wikipediaURL, timeoutFunction, successFunction, apiFailFunction);
}

var wikipediaImagesRequest = function(query) {
  var wikipediaURL = "https://en.wikipedia.org/w/api.php?action=query&pageids=" +
            query +
            "&generator=images&prop=imageinfo&iiprop=url|dimensions|mime|user|timestamp&format=json&iiurlwidth=800";
  var timeoutFunction = function() {
    console.log('failed to get wikipedia images');
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
    lvm.addWikipediaImages(images);
  }
  wikipediaRequest(wikipediaURL, timeoutFunction, successFunction, apiFailFunction);
}