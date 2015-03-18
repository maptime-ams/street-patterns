function scrollTween(offset) {
  return function() {
    var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
    return function(t) { scrollTo(0, i(t)); };
  };
}

// Adapted from https://github.com/perliedman/query-overpass
function query_overpass(query, cb) {
  var overpassUrl = 'http://overpass-api.de/api/interpreter';

  d3.json(overpassUrl)
      .header("Content-Type", "application/json")
      .post(query, function(error, json) {
        if (error && error.statusCode) {
          cb({
            message: "Request failed: HTTP " + error.statusCode,
            statusCode: error.status
          });
        } else if (error) {
          cb({
            message: "Unknown error"
          });
        } else {
          cb(null, osmtogeojson(json));
        }
      });
};

function addTileLayer(map, opacity) {
  if (!opacity) {
    opacity = 1;
  }

  var mapId = "bertspaan.ccb08263",
      accessToken = 'pk.eyJ1IjoiYmVydHNwYWFuIiwiYSI6ImR3dERiQk0ifQ.DLbScmbRohc3Sqv7prfhqw',
      tileUrl = "https://{s}.tiles.mapbox.com/v4/" + mapId + "/{z}/{x}/{y}.png?access_token=" + accessToken,
      tileLayer = L.tileLayer(tileUrl, {
        opacity: opacity
      }).addTo(map);
}
