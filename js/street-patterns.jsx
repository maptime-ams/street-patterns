var Steps = React.createClass({
  render: function() {
    var steps = this;

    return (
      <div id="steps">
      {this.props.steps.map(function(step, index) {

        var boundNextStep = steps.onNextStep.bind(steps, index);
        return React.createElement(step, {
          key: index,
          onNextStep: null
        });
      })}
      </div>
    );
  },

  onNextStep: function(index) {

  }
});

var StepIntro = React.createClass({

  render: function() {
    return (
      <section>
        <div className="container">
          <div className="row">
            <h1>Hallo</h1>
            hallotjes
          </div>
        </div>
      </section>
    )
  }
});

var StepMap = React.createClass({

  render: function() {
    return (
      <section>
        <div id="step-map-map" />
        <div id="step-map-hole" />
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
      tileLayer = L.tileLayer(tileUrl, {
      }).addTo(map),
      hash = new L.Hash(map);

    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    this.map = map;
  },
});

var StepOverpass = React.createClass({

  render: function() {
    return (
      <section>
        Intro
      </section>
    )
  }
});

var StepGeoJSON = React.createClass({

  render: function() {
    return (
      <section>
        Intro
      </section>
    )
  }
});


var steps = [
  StepIntro,
  StepMap,
  StepOverpass,
  StepGeoJSON
  // StepTurf
  // StepSVG
  // StepDone
];

React.render(
  <Steps steps={steps}/>,
  document.getElementById('steps-container')
);
