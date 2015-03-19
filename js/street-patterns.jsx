var Steps = React.createClass({
  render: function() {
    var _this = this;

    return (
      <div id="steps">
      {this.props.steps.slice(0, this.props.stepData.length).map(function(step, index) {

        var boundNextStep = _this.onNextStep.bind(_this, index);
        return React.createElement(step.component, {
          key: index,
          data: _this.props.stepData[index],
          onNextStep: boundNextStep,
          backgroundColor: step.props.backgroundColor
        });
      })}
      </div>
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

var StepIntro = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div className="container">
          <div className="row">
            <h1>Maptime Amsterdam #5: Street Patterns</h1>
            <p></p>
            <p>This is a tutorial on using <a href="http://wiki.openstreetmap.org/wiki/Key:highway">OpenStreetMap road data</a> to make <a href="http://dataphys.org/">physical visualizations</a> using <a href="http://fablab.waag.org/machines">Fablab equipment</a>. Follow along, and don&#39;t forget to click on all the links to read some background information!</p>
            <p>Beautiful patterns can emerge from a city&#39;s street network (<a href="http://www.fredfeddes.nl/">Fred Feddes</a> told us today that some of the patterns in the streets of Amsterdam are more than a 1000 years old), and by using only open data and open source tools, we can extract those patterns, and visualize and <i>physicalize</i> them.</p>

            <p>This tutorial was made by <a href="http://bertspaan.nl">Bert Spaan</a> for the <a href="http://www.meetup.com/Maptime-AMS/events/220184211/">fifth edition</a> of <a href="http://maptime-ams.github.io/">Maptime Amsterdam</a>, and should work with Chrome, Firefox and Safari (and a screen resolution of at least 1280 by 800...). The source code is available on <a href="https://github.com/maptime-ams/street-patterns">GitHub</a>.</p>
            <p>On the next page, you can drag the map to find a street pattern you like, or search for a specific place.</p>
          </div>
        </div>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>OK, let&#39;s start!</button>
        </div>
      </section>
    )
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});

var StepMap = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div id="step-map-map" className="map"/>
        <div id="step-map-hole" />
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Yes, I like this street pattern!</button>
        </div>
        <div className="input-top">
          <input type="search" placeholder="Search location..." id="step-map-geocode" onKeyUp={this.onGeocode}/>
        </div>
      </section>
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

var StepOverpass = React.createClass({
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
      <section>
        <div className="container">
          <div className="row">
            <h2>Get OpenStreetMap data with the Overpass API</h2>
            <p><a href="http://www.openstreetmap.org/">OpenStreetMap</a> is an amazing source of geographic data. Make sure to sign up for an account, and try the <a href="http://ideditor.com/">iD editor</a> to see how easy it is to edit the map yourself. You can use OSM to make maps (for example, with <a href="https://www.mapbox.com/mapbox-studio/">Mapbox Studio</a>), but you can also extract a subset of the data a do with it whatever you like. This tuturial just uses OSM&#39;s <a href="http://wiki.openstreetmap.org/wiki/Key:highway"><code>highway</code> tags</a> (which represent road data in OSM).</p>

            <p>There are multiple ways to download OpenStreetMap data. For example, you can use <a href="https://mapzen.com/metro-extracts/">Mapzen Metro Extracts</a> if you need data for larger metropolitan areas, or use the <a href="http://overpass-api.de/">Overpass API</a> to query and download a specific subset of the data. <a href="http://overpass-turbo.eu/">Overpass Turbo</a> allows you to test and play with the Overpass API. This tutorial uses <a href="https://github.com/tyrasd/osmtogeojson">osmtogeojson</a>, a JavaScript module to convert Overpass API results to <a href="http://geojson.io">GeoJSON</a>.
            </p>
            <p>
            If you press Execute, the query below is sent to the Overpass API. You can use <a href="http://overpass-turbo.eu/">Overpass Turbo</a> to test the query yourself.
            </p>
            <p id="step-overpass-editor-container">
              <textarea id="step-overpass-editor">
                {this.query}
              </textarea>
            </p>
          </div>
        </div>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Execute! (This may take a couple of seconds...)</button>
        </div>
      </section>
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



var StepGeoJSON = React.createClass({
  mixins: [StepMixin],

  render: function() {
    var geojson = JSON.stringify(this.props.data.geojson, null, 2);
    return (
      <section>
        <div className="container">
          <div className="row">
            <h2>GeoJSON data from OpenStreetMap</h2>
            <p>
              We have data! (You could try to copy and paste the data into <a href="http://geojson.io/">geojson.io</a>.)
            </p>
            <p id="step-geojson-editor-container">
              <textarea id="step-geojson-editor">
                {geojson}
              </textarea>
            </p>
          </div>
        </div>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Show this GeoJSON on the map!</button>
        </div>
      </section>
    )
  },

  componentDidMount: function() {
    this.editor = CodeMirror.fromTextArea(document.getElementById("step-geojson-editor"), {
      lineNumbers: true,
      mode: "application/json"
    });
  },

  onButtonClick: function() {
    this.props.onNextStep({
      geojson: this.editor.getValue()
    });
  }
});


var StepGeoJSONMap = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div id="step-geojson-map" className="map"/>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Next!</button>
        </div>
      </section>
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


var StepTurfIntro = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div className="container">
          <div className="row">
            <h2>Turf - geospatial functions with JavaScript!</h2>
            <p>
              The GeoJSON OpenStreetMap results from the Overpass API are only <a href="http://geojson.org/geojson-spec.html#linestring">line data</a>. We can use <a href="http://turfjs.org/">Turf</a>&#39;s <a href="http://turfjs.org/static/docs/module-turf_buffer.html"><code>buffer</code> function</a> to compute an area around all the lines, and convert the line data to polygons.
            </p>
            <p><b>Turf is great!</b> No need for expensive or complicated GIS software, with Turf you can run all sorts of geospatial functions directly in your browser. Online documentation and tutorials are available on <a href="http://turfjs.org/learn.html">Turf&#39;s website.</a></p>
          </div>
        </div>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Compute! (This, again, may take a couple of seconds...)</button>
        </div>
      </section>
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

var StepTurfBuffer = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div id="step-turf-buffer-map" className="map"/>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Next!</button>
        </div>
      </section>
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

var StepTurfIntersectIntro = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div className="container">
          <div className="row">
            <h2>No more messy lines</h2>
            <p>
              That looked pretty good, we&#39;re almost ready. We just want our circle back! Turf has a <a href="http://turfjs.org/static/docs/module-turf_intersect.html"><code>intersect</code> function</a> which we can use to compute the <a href="http://en.wikipedia.org/wiki/Boolean_operations_on_polygons">boolean intersection</a> of our buffered road lines and a circular polygon.
            </p>
          </div>
        </div>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>I want my circle!</button>
        </div>
      </section>
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


var StepTurfIntersect = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div id="step-turf-intersect-map" className="map"/>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Yeah!</button>
        </div>
      </section>
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

var StepSVGIntro = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div className="container">
          <div className="row">
            <h2>GeoJSON to SVG</h2>
            <p>Vector graphics software does not understand GeoJSON. Luckily, it&#39;s easy to steal the <a href="http://en.wikipedia.org/wiki/Scalable_Vector_Graphics">SVG shapes</a> produced by <a href="http://leafletjs.com/">Leaflet</a> in the map visualization above. (You can see the SVG element yourself by using your browser&#39;s developer tools and looking for the <code>#step-turf-intersect-map .leaflet-overlay-pane</code> DOM element.)
            </p>
            <p>
              <img src="images/developer-console.png" />
            </p>
          </div>
        </div>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Steal me my SVG!</button>
        </div>
      </section>
    )
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});

var StepSVG = React.createClass({
  mixins: [StepMixin],

  render: function() {
    var svgSrc = "data:image/svg+xml;base64," + this.props.data.svg;
    return (
      <section>
        <div className="container">
          <div className="row">
            <h2>SVG</h2>
            <p>
              Your SVG file is ready! Right-click the image below and choose <i>Save Image As...</i> (or just <a id="step-geojson-download" href-lang='image/svg+xml' title='street-pattern.svg' href={svgSrc}>click this link</a> to download the file).
            </p>
            <p>
              <img id="step-svg-img" alt="street-pattern" download='street-pattern.svg' src={svgSrc}/>
            </p>
          </div>
        </div>
        <div className="button-bottom">
          <button onClick={this.onButtonClick}>Next!</button>
        </div>
      </section>
    )
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }
});

var StepDone = React.createClass({
  mixins: [StepMixin],

  render: function() {
    return (
      <section>
        <div className="container">
          <div className="row">
            <h2>To the Fablab!</h2>
            <p>Now you can open and edit the SVG file with a vector graphics editor, e.g. <a href="http://www.adobe.com/products/illustrator.html">Adobe Illustrator</a> or <a href="https://inkscape.org/en/">Inkscape</a> (Inkscape is free and open source!). To produce good results with the Fablab&#39;s <a href="http://fablab.waag.org/machine/laser-cutter">laser cutter</a> or <a href="http://fablab.waag.org/machine/vinyl-cutter">vinyl cutter</a>, you usually need to tweak with the SVG&#39;s dimensions and line widths.</p>
            <p>
              <b>This is the end of this tutorial - bring your final SVG file to the Fablab and start making!</b>
            </p>
            <p>
              <img src="images/budapest.jpg" />
            </p>
          </div>
        </div>
      </section>
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
  <Steps steps={steps} stepData={stepData}/>,
  document.getElementById('steps-container')
);
