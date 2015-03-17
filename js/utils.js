function scrollTween(offset) {
  return function() {
    var i = d3.interpolateNumber(window.pageYOffset || document.documentElement.scrollTop, offset);
    return function(t) { scrollTo(0, i(t)); };
  };
}
