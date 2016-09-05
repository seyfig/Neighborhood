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
    formatted_address: '608 Point Lobos Ave, San Francisco, CA 94121, USA'
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
    formatted_address: 'U.S. Highway 101, Sausalito, CA 94965, USA'
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
    formatted_address: 'Lombard St, San Francisco, CA 94133, USA'
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
    formatted_address: 'JFK Drive and 25th Avenue, San Francisco, CA 94121, USA'
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
    formatted_address: '333 Post St, San Francisco, CA 94108, USA'
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