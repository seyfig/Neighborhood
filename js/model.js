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
  var address = data.formatted_address.split(',');
  if (address.length === 3) {
    address.unshift("");
  }
  if (address.length === 4) {
    this.street = ko.observable(address[0].trim());
    this.city = ko.observable(address[1].trim());
    this.state = ko.observable(address[2].trim());
    this.country = ko.observable(address[3].trim());
  }
  else {
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
  var wikipedia = Wikipedia({
    text: "",
    title: ""
  });
  this.wikipedia = ko.observable(wikipedia);
  this.wikipediaStatus = 0;
  // TODO REFACTOR
  // 0 not called
  // 1 waiting call exists
  // 2 received data, don't need to call again
  // 3 no data found, don't need to call again
  this.wikipediaSearchStatus = ko.observable(0);
  // TODO REFACTOR
  // 0 search with name and city
  // 1 search with name
this.wikipediaQuery = ko.computed(function() {
    if (this.wikipediaSearchStatus() === 0) {
      return this.name() + " " + this.city();
    }
    else if (this.wikipediaSearchStatus() === 1) {
      return this.name();
    }
  },this);
};

var Message = function(data) {
  this.component = ko.observable(data.component);
  this.text = ko.observable(data.text);
  this.kind = ko.observable(data.kind);
};

var Wikipedia = function(data) {
  this.locationId = data.locationId,
  this.text = ko.observable(data.text);
  this.title = data.title;
  this.longText = ko.observable("Loading");
  this.isDetailLoaded = ko.observable(false);
  this.isImagesLoaded = ko.observable(false);
  this.images = ko.observableArray([]);
  this.currentImage = ko.observable(new WikipediaImage({
    thumburl: ''
  }));
  this.pageid = data.pageid;
  this.pageURL = ko.observable(data.pageURL);
};

var WikipediaImage = function(data) {
  this.url = ko.observable(data.url);
  this.thumburl = ko.observable(data.thumburl);
  this.descriptionurl = ko.observable(data.descriptionurl);
  this.user = ko.observable(data.user);
  var d = new Date(data.timestamp);
  this.localDateString = ko.observable(d.toLocaleString());
};