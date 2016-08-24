// TODO replace '  ' with '  '

var getFirstChild = function(list) {
  var item;
  for (var index in list) {
    item = list[index];
    break;
  }
  return item;
}

var wikipediaSearchRequest = function(query) {
  var wikipediaURL = "http://en.wikipedia.org/w/api.php?action=opensearch&search=" +
            query +
            "&format=json&callback=wikiCallback&redirects=resolve&prop=extracts&exintro=&explaintext=&rvprop=content";
  var wikiRequestTimeout = setTimeout(function() {
    console.log('failed to get wikipedia resources');
  },2000);
  $.ajax({
    type: "GET",
    url: wikipediaURL,
    dataType: "jsonp"
  })
  .done(function(response) {
    clearTimeout(wikiRequestTimeout);
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
  })
  .fail(function(jqxhr, textStatus, error) {
      console.log("w - error");
      console.log(jqxhr);
      console.log(textStatus);
      console.log(error);
  });
}

var wikipediaQueryRequest = function(query) {
  var wikipediaURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&redirects=resolve&prop=extracts&exintro=&explaintext=&titles=" +
            query;
  var wikiRequestTimeout = setTimeout(function() {
    console.log('failed to get wikipedia content');
  },2000);
  $.ajax({
    type: "GET",
    url: wikipediaURL,
    dataType: "jsonp"
  })
  .done(function(response) {
    clearTimeout(wikiRequestTimeout);
    res2 = response;
    var pages = response.query.pages;
    var page = getFirstChild(pages);
	var wikipediaData = {
	  longText: page.extract,
	  pageid: page.pageid
	};
    lvm.addWikipediaDetail(wikipediaData);
    wikipediaImagesRequest(page.pageid);
  })
  .fail(function(jqxhr, textStatus, error) {
      console.log("w - error");
      console.log(jqxhr);
      console.log(textStatus);
      console.log(error);
  });
}

var wikipediaImagesRequest = function(query) {
  var wikipediaURL = "https://en.wikipedia.org/w/api.php?action=query&pageids=" +
  					query +
  					"&generator=images&prop=imageinfo&iiprop=url|dimensions|mime|user|timestamp&format=json&iiurlwidth=800";
  var wikiRequestTimeout = setTimeout(function() {
    console.log('failed to get wikipedia images');
  },2000);
  $.ajax({
    type: "GET",
    url: wikipediaURL,
    dataType: "jsonp"
  })
  .done(function(response) {
    clearTimeout(wikiRequestTimeout);
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
  })
  .fail(function(jqxhr, textStatus, error) {
      console.log("w - error");
      console.log(jqxhr);
      console.log(textStatus);
      console.log(error);
  });
}


var wikipediaGeoRequest = function(query) {
  console.log(query);
  var wikipediaURL = "http://en.wikipedia.org/w/api.php?action=query&format=json&list=geosearch&gscoord=" +
             query.lat.toString() +
             "%7C" +
             query.lng.toString() +
             "&gsradius=500&gslimit=10";
  var wikiRequestTimeout = setTimeout(function() {
    console.log('failed to get wikipedia resources');
  },2000);
  var data;
  $.ajax({
    type: "GET",
    url: wikipediaURL,
    dataType: "jsonp"
  })
  .done(function(response,a,b,c,d) {
    console.log("w - success");
    console.log(response);
    console.info(response);
    console.debug(response);
    console.dir(response);
    clearTimeout(wikiRequestTimeout);
    data = response;
  console.log("best result");
    console.log(response[1][0]);
    console.log("best result -text");
    console.log(response[2][0]);
  })
  .fail(function(jqxhr, textStatus, error) {
      console.log("w - error");
      console.log(jqxhr);
      console.log(textStatus);
      console.log(error);
  });
  return data;
}

