var Steps = React.createClass({
  render: function() {
    var _this = this;

    return (
      <div id="steps">
      {this.props.steps.slice(0, this.props.stepData.length).map(function(step, index) {

        var boundNextStep = _this.onNextStep.bind(_this, index);
        return React.createElement(step, {
          key: index,
          data: _this.props.stepData[index],
          onNextStep: boundNextStep
        });
      })}
      </div>
    );
  },

  onNextStep: function(index, data) {
    var stepData = this.props.stepData.slice(0, index + 1);
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

var StepIntro = React.createClass({

  render: function() {
    return (
      <section>
        <div className="container">
          <div className="row">
            <h1>Hallo</h1>
            <p>hallotjes</p>
            <p>
              <button onClick={this.onButtonClick}>Ok!</button>
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

var StepMap = React.createClass({
  render: function() {
    return (
      <section>
        <div id="step-map-map" className="map"/>
        <div id="step-map-hole" />
        <div id="step-map-button">
          <div className="container">
            <div className="row">
              <button onClick={this.onButtonClick}>Yes, I like these streets!</button>
            </div>
          </div>
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
      tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileLayer = L.tileLayer(tileUrl).addTo(map),
      hash = new L.Hash(map);

    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    this.map = map;
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
  render: function() {
    var radius = this.props.data.radius,
        center = this.props.data.center,
        query = [
          "[out:json];",
          "way[highway](around:" + radius + "," + center.geometry.coordinates.reverse().join(",") + ");",
          "(._;>;);",
          "out;"
        ].join("\n");


    this.query = query;

    return (
      <section>
        <div className="container">
          <div className="row">
            <h1>Overpass API</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>
              <textarea id="step-overpass-editor">
                {this.query}
              </textarea>
            </p>
            <p>
              <button onClick={this.onButtonClick}>Ok!</button>
            </p>
          </div>
        </div>
      </section>
    )
  },

  componentDidMount: function() {
    this.editor = CodeMirror.fromTextArea(document.getElementById("step-overpass-editor"), {
      lineNumbers: true
    });
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
  render: function() {
    return (
      <section>
        <div id="step-geojson-map" className="map"/>
        <div id="step-geojson-button" className="button-bottom">
          <div className="row">
            <button onClick={this.onButtonClick}>Hopsa!</button>
            <a id="step-geojson-download" href-lang='image/svg+xml' title='street-pattern.svg'>Download</a>
          </div>
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
        opacity: 0.65
      },
      tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileLayer = L.tileLayer(tileUrl, {
        opacity: 0.3
      }).addTo(map),
      geojsonLayer = new L.geoJson(this.props.data.geojson, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, pointStyle);
        }
      }
      ).addTo(map);

    map.fitBounds(geojsonLayer.getBounds());

    map.touchZoom.disable();
    map.scrollWheelZoom.disable();

    var svg = d3.select("#step-geojson-map .leaflet-overlay-pane")
            .html()
            .replace("<svg", '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"'),
        b64 = btoa(svg);

    d3.select("#step-geojson-download").attr("href", "data:image/svg+xml;base64,\n" + b64);

    this.map = map;
  },

  onButtonClick: function() {

  }
});


var steps = [
  StepIntro,
  StepMap,
  StepOverpass,
  StepGeoJSON,
  //StepGeoJSONMap
  // StepBuffer
  // StepIntersect
  // StepSVG
  // StepDone
];

var stepData = [
  {}
];

React.render(
  <Steps steps={steps} stepData={stepData}/>,
  document.getElementById('steps-container')
);
