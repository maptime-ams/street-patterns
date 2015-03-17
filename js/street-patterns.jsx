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
        <div id="step-map-map" />
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
      tileLayer = L.tileLayer(tileUrl, {
      }).addTo(map),
      hash = new L.Hash(map);

    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    this.map = map;
  },

  onButtonClick: function() {
    this.props.onNextStep({});
  }

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

var stepData = [
  {}
];

React.render(
  <Steps steps={steps} stepData={stepData}/>,
  document.getElementById('steps-container')
);
