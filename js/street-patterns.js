var Steps = React.createClass({displayName: "Steps",
  render: function() {
    var _this = this;

    return (
      React.createElement("div", {id: "steps"}, 
      this.props.steps.slice(0, this.props.stepData.length).map(function(step, index) {

        var boundNextStep = _this.onNextStep.bind(_this, index);
        return React.createElement(step.component, {
          key: index,
          data: _this.props.stepData[index],
          onNextStep: boundNextStep,
          backgroundColor: step.props.backgroundColor
        });
      })
      )
    );
  },

  onNextStep: function(index, data) {
    var stepData = this.props.stepData.slice(0, index + 1),
        lastStepData = stepData[stepData.length - 1];

    for (var attrname in lastStepData) {
      if (!data[attrname]) {
        data[attrname] = lastStepData[attrname];
      }
    }

    stepData.push(data);
    this.setProps({stepData: stepData});

    setTimeout(function() {
      var node = document.querySelector("#steps section:nth-child(" + (index + 2) + ")");
      d3.transition()
          .duration(900)
          .tween("scroll", scrollTween(node.offsetTop));
    }, 150);
  }
});

var StepMixin = {
  componentDidMount: function() {
    React.findDOMNode(this).style.backgroundColor = this.props.backgroundColor;
  }
}

var StepIntro = React.createClass({displayName: "StepIntro",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h1", null, "Maptime Amsterdam #5: Street Patterns"), 
            React.createElement("p", null), 
            React.createElement("p", null, "This is a tutorial on using ", React.createElement("a", {href: "http://wiki.openstreetmap.org/wiki/Key:highway"}, "OpenStreetMap road data"), " to make ", React.createElement("a", {href: "http://dataphys.org/"}, "physical visualizations"), " using ", React.createElement("a", {href: "http://fablab.waag.org/machines"}, "Fablab equipment"), ". Follow along, and don't forget to click on all the links to read some background information!"), 
            React.createElement("p", null, "Beautiful patterns can emerge from a city's street network (", React.createElement("a", {href: "http://www.fredfeddes.nl/"}, "Fred Feddes"), " told us today that some of the patterns in the streets of Amsterdam are more than a 1000 years old), and by using only open data and open source tools, we can extract those patterns, and visualize and ", React.createElement("i", null, "physicalize"), " them."), 

            React.createElement("p", null, "This tutorial was made by ", React.createElement("a", {href: "http://bertspaan.nl"}, "Bert Spaan"), " for the ", React.createElement("a", {href: "http://www.meetup.com/Maptime-AMS/events/220184211/"}, "fifth edition"), " of ", React.createElement("a", {href: "http://maptime-ams.github.io/"}, "Maptime Amsterdam"), ", and should work with Chrome, Firefox and Safari. The source code is available on ", React.createElement("a", {href: "https://github.com/maptime-ams/street-patterns"}, "GitHub"), "."), 
            React.createElement("p", null, "On the next page, you can drag the map to find a street pattern you like, or search for a specific place.")
          )
        ), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "OK, let's start!")
        )
      )
    )
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});

var StepMap = React.createClass({displayName: "StepMap",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {id: "step-map-map", className: "map"}), 
        React.createElement("div", {id: "step-map-hole"}), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Yes, I like this street pattern!")
        ), 
        React.createElement("div", {className: "input-top"}, 
          React.createElement("input", {type: "search", placeholder: "Search location...", id: "step-map-geocode", onKeyUp: this.onGeocode})
        )
      )
    )
  },

  componentDidMount: function() {
    var map = L.map('step-map-map', {
        zoomControl: false,
        attributionControl: false,
        minZoom: 17, maxZoom: 17,
        zoom: 17,
        center: [52.3404,4.9431]
      }),
      hash = new L.Hash(map);

    addTileLayer(map);

    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    this.map = map;
  },

  onGeocode: function(e) {
    var _this = this;

    if (e.keyCode == 13) {
      var value = d3.select("#step-map-geocode").property('value');
      d3.json("http://nominatim.openstreetmap.org/?format=json&q=" + value + "&format=json&limit=1", function(error, data) {
        if (data[0] && data[0].lat) {
          _this.map.panTo([data[0].lat, data[0].lon]);
        }
      });
    }
  },

  onButtonClick: function() {
    var center = this.map.getCenter();
    this.props.onNextStep({
      center: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [center.lng, center.lat]
        }
      },
      radius: 200
    });
  }

});

var StepOverpass = React.createClass({displayName: "StepOverpass",
  mixins: [StepMixin],

  render: function() {
    var radius = this.props.data.radius,
        center = this.props.data.center,
        coordinates = center.geometry.coordinates,
        query = [
          "[out:json];",
          "way[\"highway\"](around:" + radius + "," + [coordinates[1], coordinates[0]].join(",") + ");",
          "(._;>;);",
          "out;"
        ].join("\n");

    this.query = query;

    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h2", null, "Get OpenStreetMap data with the Overpass API"), 
            React.createElement("p", null, React.createElement("a", {href: "http://www.openstreetmap.org/"}, "OpenStreetMap"), " is an amazing source of geographic data. Make sure to sign up for an account, and try the ", React.createElement("a", {href: "http://ideditor.com/"}, "iD editor"), " to see how easy it is to edit the map yourself. You can use OSM to make maps (for example, with ", React.createElement("a", {href: "https://www.mapbox.com/mapbox-studio/"}, "Mapbox Studio"), "), but you can also extract a subset of the data a do with it whatever you like. This tuturial just uses OSM's ", React.createElement("a", {href: "http://wiki.openstreetmap.org/wiki/Key:highway"}, React.createElement("code", null, "highway"), " tags"), " (which represent road data in OSM)."), 

            React.createElement("p", null, "There are multiple ways to download OpenStreetMap data. For example, you can use ", React.createElement("a", {href: "https://mapzen.com/metro-extracts/"}, "Mapzen Metro Extracts"), " if you need data for larger metropolitan areas, or use the ", React.createElement("a", {href: "http://overpass-api.de/"}, "Overpass API"), " to query and download a specific subset of the data. ", React.createElement("a", {href: "http://overpass-turbo.eu/"}, "Overpass Turbo"), " allows you to test and play with the Overpass API. This tutorial uses ", React.createElement("a", {href: "https://github.com/tyrasd/osmtogeojson"}, "osmtogeojson"), ", a JavaScript module to convert Overpass API results to ", React.createElement("a", {href: "http://geojson.io"}, "GeoJSON"), "."
            ), 
            React.createElement("p", null, 
            "If you press Execute, the query below is sent to the Overpass API. You can use ", React.createElement("a", {href: "http://overpass-turbo.eu/"}, "Overpass Turbo"), " to test the query yourself."
            ), 
            React.createElement("p", {id: "step-overpass-editor-container"}, 
              React.createElement("textarea", {id: "step-overpass-editor"}, 
                this.query
              )
            )
          )
        ), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Execute! (This may take a couple of seconds...)")
        )
      )
    )
  },

  componentDidMount: function() {
    this.editor = CodeMirror.fromTextArea(document.getElementById("step-overpass-editor"), {
      lineNumbers: true,
      mode: "text/x-csrc"
    });
  },

  componentDidUpdate: function() {
    this.editor.setValue(this.query);
  },

  onButtonClick: function() {
    var _this = this;

    query_overpass(this.editor.getValue(), function(error, geojson) {
      if (error || !geojson.features || geojson.features.length == 0) {

      } else {
        // Filter out Point features (OSM nodes), and go to next step
        _this.props.onNextStep({geojson: {
          type: "FeatureCollection",
          features: geojson.features.filter(function(feature) {
            return feature.geometry.type !== "Point";
          })
        }});
      }
    });

  }
});



var StepGeoJSON = React.createClass({displayName: "StepGeoJSON",
  mixins: [StepMixin],

  render: function() {
    var geojson = JSON.stringify(this.props.data.geojson, null, 2);
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h2", null, "GeoJSON data from OpenStreetMap"), 
            React.createElement("p", null, 
              "We have data! (You could try to copy and paste the data into ", React.createElement("a", {href: "http://geojson.io/"}, "geojson.io"), ".)"
            ), 
            React.createElement("p", {id: "step-geojson-editor-container"}, 
              React.createElement("textarea", {id: "step-geojson-editor"}, 
                geojson
              )
            )
          )
        ), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Show this GeoJSON on the map!")
        )
      )
    )
  },

  componentDidMount: function() {
    this.editor = CodeMirror.fromTextArea(document.getElementById("step-geojson-editor"), {
      lineNumbers: true,
      mode: "application/json"
    });
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});


var StepGeoJSONMap = React.createClass({displayName: "StepGeoJSONMap",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {id: "step-geojson-map", className: "map"}), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Next!")
        )
      )
    )
  },

  componentDidMount: function() {
    var map = L.map('step-geojson-map', {
        attributionControl: false,
        minZoom: 14, maxZoom: 17,
      }),
      pointStyle = {},
      lineStyle = {
        color: "black",
        weight: 3,
        opacity: 1
      },
      geojsonLayer = new L.geoJson(this.props.data.geojson, {
        style: lineStyle,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, pointStyle);
        }
      }
      ).addTo(map);

    addTileLayer(map, 0.3);

    map.fitBounds(geojsonLayer.getBounds());

    map.touchZoom.disable();
    map.scrollWheelZoom.disable();

    this.map = map;
  },

  onButtonClick: function() {
    this.props.onNextStep({
      geojson: this.props.data.geojson
    });
  }
});


var StepTurfIntro = React.createClass({displayName: "StepTurfIntro",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h2", null, "Turf - geospatial functions with JavaScript!"), 
            React.createElement("p", null, 
              "The GeoJSON OpenStreetMap results from the Overpass API are only ", React.createElement("a", {href: "http://geojson.org/geojson-spec.html#linestring"}, "line data"), ". We can use ", React.createElement("a", {href: "http://turfjs.org/"}, "Turf"), "'s ", React.createElement("a", {href: "http://turfjs.org/static/docs/module-turf_buffer.html"}, React.createElement("code", null, "buffer"), " function"), " to compute an area around all the lines, and convert the line data to polygons."
            ), 
            React.createElement("p", null, React.createElement("b", null, "Turf is great!"), " No need for expensive or complicated GIS software, with Turf you can run all sorts of geospatial functions directly in your browser. Online documentation and tutorials are available on ", React.createElement("a", {href: "http://turfjs.org/learn.html"}, "Turf's website."))
          )
        ), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Compute! (This, again, may take a couple of seconds...)")
        )
      )
    )
  },

  onButtonClick: function() {
    var roadWidth = 8; // meters
    // TODO: Start loading anim.
    var union;
    this.props.data.geojson.features.forEach(function(feature, i) {
      var buffered = turf.buffer(feature, roadWidth, 'meters').features[0];
      if (union) {
        union = turf.union(buffered, union);
      } else {
        union = buffered;
      }
    });

    this.props.onNextStep({
      geojson: union
    });
  }
});

var StepTurfBuffer = React.createClass({displayName: "StepTurfBuffer",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {id: "step-turf-buffer-map", className: "map"}), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Next!")
        )
      )
    )
  },

  componentDidMount: function() {
    var map = L.map('step-turf-buffer-map', {
        attributionControl: false,
        minZoom: 14, maxZoom: 17,
      }),
      pointStyle = {},
      lineStyle = {
        color: "black",
        weight: 3,
        opacity: 1
      },
      geojsonLayer = new L.geoJson(this.props.data.geojson, {
        style: lineStyle,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, pointStyle);
        }
      }
      ).addTo(map);

    addTileLayer(map, 0.3);

    map.fitBounds(geojsonLayer.getBounds());

    map.touchZoom.disable();
    map.scrollWheelZoom.disable();

    this.map = map;
  },

  onButtonClick: function() {
    this.props.onNextStep({
      geojson: this.props.data.geojson
    });
  }
});

var StepTurfIntersectIntro = React.createClass({displayName: "StepTurfIntersectIntro",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h2", null, "No more messy lines"), 
            React.createElement("p", null, 
              "That looked pretty good, we're almost ready. We just want our circle back! Turf has a ", React.createElement("a", {href: "http://turfjs.org/static/docs/module-turf_intersect.html"}, React.createElement("code", null, "intersect"), " function"), " which we can use to compute the ", React.createElement("a", {href: "http://en.wikipedia.org/wiki/Boolean_operations_on_polygons"}, "boolean intersection"), " of our buffered road lines and a circular polygon."
            )
          )
        ), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "I want my circle!")
        )
      )
    )
  },

  onButtonClick: function() {
    var _this = this,
        angles = [];

    for (var a = 0; a <= 360; a++) {
      angles.push(a);
    }

    var circle = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          angles.map(function(a) {
            var point = turf.destination(_this.props.data.center, _this.props.data.radius / 1000, a, "kilometers");
            return point.geometry.coordinates;
          })
        ]
      }
    };

    var intersection = turf.intersect(this.props.data.geojson, circle);

    this.props.onNextStep({
      geojson: intersection
    });
  }
});


var StepTurfIntersect = React.createClass({displayName: "StepTurfIntersect",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {id: "step-turf-intersect-map", className: "map"}), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Yeah!")
        )
      )
    )
  },

  componentDidMount: function() {
    var map = L.map('step-turf-intersect-map', {
        attributionControl: false,
        minZoom: 14, maxZoom: 17,
      }),
      pointStyle = {},
      lineStyle = {
        color: "black",
        weight: 3,
        opacity: 1
      },
      geojsonLayer = new L.geoJson(this.props.data.geojson, {
        style: lineStyle,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, pointStyle);
        }
      }
      ).addTo(map);

    addTileLayer(map, 0.3);

    map.fitBounds(geojsonLayer.getBounds());

    map.touchZoom.disable();
    map.scrollWheelZoom.disable();

    this.map = map;
  },

  onButtonClick: function() {
    var rect = d3.select("#step-turf-intersect-map .leaflet-overlay-pane svg")[0][0].getBBox(),
        svgAttrs = 'viewBox="' + [rect.x, rect.y, rect.width, rect.height].join(" ") + '"'
            + ' height="' + rect.height + '" width="' + rect.width + '"'
            + ' style="transform: translate(0, 0);"',
        svg = d3.select("#step-turf-intersect-map .leaflet-overlay-pane")
            .html()
            .replace(/<svg .*?>/, '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ' + svgAttrs + '>'),
        b64 = btoa(svg);

    this.props.onNextStep({
      svg: b64
    });
  }
});

var StepSVGIntro = React.createClass({displayName: "StepSVGIntro",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h2", null, "GeoJSON to SVG"), 
            React.createElement("p", null, "Vector graphics software does not understand GeoJSON. Luckily, it's easy to steal the ", React.createElement("a", {href: "http://en.wikipedia.org/wiki/Scalable_Vector_Graphics"}, "SVG shapes"), " produced by ", React.createElement("a", {href: "http://leafletjs.com/"}, "Leaflet"), " in the map visualization above. (You can see the SVG element yourself by using your browser's developer tools and looking for the ", React.createElement("code", null, "#step-turf-intersect-map .leaflet-overlay-pane"), " DOM element.)"
            ), 
            React.createElement("p", null, 
              React.createElement("img", {src: "images/developer-console.png"})
            )
          )
        ), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Steal me my SVG!")
        )
      )
    )
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});

var StepSVG = React.createClass({displayName: "StepSVG",
  mixins: [StepMixin],

  render: function() {
    var svgSrc = "data:image/svg+xml;base64," + this.props.data.svg;
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h2", null, "SVG"), 
            React.createElement("p", null, 
              "Your SVG file is ready! Right-click the image below and choose ", React.createElement("i", null, "Save Image As..."), " (or just ", React.createElement("a", {id: "step-geojson-download", "href-lang": "image/svg+xml", title: "street-pattern.svg", href: svgSrc}, "click this link"), " to download the file)."
            ), 
            React.createElement("p", null, 
              React.createElement("img", {id: "step-svg-img", alt: "street-pattern", download: "street-pattern.svg", src: svgSrc})
            )
          )
        ), 
        React.createElement("div", {className: "button-bottom"}, 
          React.createElement("button", {onClick: this.onButtonClick}, "Next!")
        )
      )
    )
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});

var StepDone = React.createClass({displayName: "StepDone",
  mixins: [StepMixin],

  render: function() {
    return (
      React.createElement("section", null, 
        React.createElement("div", {className: "container"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("h2", null, "To the Fablab!"), 
            React.createElement("p", null, "Now you can open and edit the SVG file with a vector graphics editor, e.g. ", React.createElement("a", {href: "http://www.adobe.com/products/illustrator.html"}, "Adobe Illustrator"), " or ", React.createElement("a", {href: "https://inkscape.org/en/"}, "Inkscape"), " (Inkscape is free and open source!). To produce good results with the Fablab's ", React.createElement("a", {href: "http://fablab.waag.org/machine/laser-cutter"}, "laser cutter"), " or ", React.createElement("a", {href: "http://fablab.waag.org/machine/vinyl-cutter"}, "vinyl cutter"), ", you usually need to tweak with the SVG's dimensions and line widths."), 
            React.createElement("p", null, 
              React.createElement("b", null, "This is the end of this tutorial - bring your final SVG file to the Fablab and start making!"), 
              React.createElement("img", {src: "images/budapest.jpg"})
            )
          )
        )
      )
    )
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});

var colors = [
  "#6d3fea", //"#4800e5",
  "#8000e1",
  "#b600de",
  "#db00cc",
  "#d80093",
  "#d5005b",
  "#d20025",
  "#ce0e00",
  "#cb4100",
  "#c87200",
  "#c5a100",
  "#b4c200",
  "#82bf00"
];

var steps = [
  { component: StepIntro, props: { color: "white"  } },
  { component: StepMap, props: { } },
  { component: StepOverpass, props: { } },
  { component: StepGeoJSON, props: { } },
  { component: StepGeoJSONMap, props: { } },
  { component: StepTurfIntro, props: { } },
  { component: StepTurfBuffer, props: { } },
  { component: StepTurfIntersectIntro, props: { } },
  { component: StepTurfIntersect, props: { } },
  { component: StepSVGIntro, props: { } },
  { component: StepSVG, props: { } },
  { component: StepDone, props: { } }
];

steps = steps.map(function(step, index) {
  step.props.backgroundColor = colors[index];
  return step;
});

var stepData = [
  {}
];

React.render(
  React.createElement(Steps, {steps: steps, stepData: stepData}),
  document.getElementById('steps-container')
);
