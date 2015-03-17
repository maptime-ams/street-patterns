var query_overpass = require('query-overpass'),
    turf = require('turf');

var radius = 350 // meters
    roadWidth = 5, // meters
    center = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [4.88329,52.38258]
      }
    },
    circle = turf.buffer(center, radius, "meters").features[0];

var angles = [];
for (var a = 0; a <= 360; a++) {
  angles.push(a);
}

var circle2 = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      angles.map(function(a) {
        var point = turf.destination(center, radius / 1000, a, "kilometers");
        return point.geometry.coordinates;
      })
    ]
  }
};

getStreets(center, radius, function(error, geojson) {
  if (error) {
    console.error(error);
  } else {
    var union;
    geojson.features.forEach(function(feature, i) {
      var buffered = turf.buffer(feature, roadWidth, 'meters').features[0];

      var intersection = turf.intersect(buffered, circle2);

      if (intersection) {
        if (union) {
          union = turf.union(intersection, union);
        } else {
          union = buffered;
        }

      }
    });
    console.log(JSON.stringify(union, null, 2));
  }
});

function getStreets(center, radius, callback) {
  var distance = Math.sqrt(radius * radius * 2) / 1000,
      southWestFeature = turf.destination(center, distance, -135, "kilometers"),
      northEastFeature = turf.destination(center, distance, 45, "kilometers"),
      southWestCoordinates = southWestFeature.geometry.coordinates,
      northEastCoordinates = northEastFeature.geometry.coordinates,
      boundingBox = southWestCoordinates.reverse().concat(northEastCoordinates.reverse()),
      query = '[out:json];way["highway"](' + boundingBox.join(",") + ');(._;>;);out;';

  query_overpass(query, function(error, data) {
    callback(error, data);
  });
}
