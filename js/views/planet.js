define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/planet.html'
], function($, _, Backbone, d3, PlanetTemplate){
  var PlanetView = Backbone.View.extend({
    el: $('#main'),

    initialize : function(){      
    },

    render: function(params){
      console.log(params);
      var compiledTemplate = _.template( PlanetTemplate, params );
      this.$el.html(compiledTemplate);
      $.getJSON('data/data.json', function(data){
        var now = new Date(d3.time.year.floor(new Date()));
              console.log(now);
              var spacetime = d3.select('.planet');
              var width = 960,
                  height = 500,
                  radius = Math.min(width, height);

              var radii = {
                "sun": radius / 8,
                "planetOrbit": radius / 2.5,
                "planet": radius / 32,
                "moonOrbit": radius / 16,
                "moon": radius / 96
              };

              // Space
              var svg = spacetime.append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

              // Sun
              svg.append("circle")
                .attr("class", "sun")
                .attr("r", radii.sun)
                .style("fill", "rgba(255, 204, 0, 1.0)");

              // Planet's orbit
              svg.append("circle")
                .attr("class", "planetOrbit")
                .attr("r", radii.planetOrbit)
                .style("fill", "none")
                .style("stroke", "rgba(255, 204, 0, 0.25)");

              // Current position of Planet in its orbit
              var planetOrbitPosition = d3.svg.arc()
                .outerRadius(radii.planetOrbit + 1)
                .innerRadius(radii.planetOrbit - 1)
                .startAngle(0)
                .endAngle(0);
              svg.append("path")
                .attr("class", "planetOrbitPosition")
                .attr("d", planetOrbitPosition)
                .style("fill", "rgba(255, 204, 0, 0.75)");

              // Planet
              svg.append("circle")
                .attr("class", "planet")
                .attr("r", radii.planet)
                .attr("transform", "translate(0," + -radii.planetOrbit + ")")
                .style("fill", "rgba(113, 170, 255, 1.0)");

              // Time of day
              var day = d3.svg.arc()
                .outerRadius(radii.planet)
                .innerRadius(0)
                .startAngle(0)
                .endAngle(0);
              svg.append("path")
                .attr("class", "day")
                .attr("d", day)
                .attr("transform", "translate(0," + -radii.planetOrbit + ")")
                .style("fill", "rgba(53, 110, 195, 1.0)");

              // Moon's orbit
              svg.append("circle")
                .attr("class", "moonOrbit")
                .attr("r", radii.moonOrbit)
                .attr("transform", "translate(0," + -radii.planetOrbit + ")")
                .style("fill", "none")
                .style("stroke", "rgba(113, 170, 255, 0.25)");

              // Current position of the Moon in its orbit
              var moonOrbitPosition = d3.svg.arc()
                .outerRadius(radii.moonOrbit + 1)
                .innerRadius(radii.moonOrbit - 1)
                .startAngle(0)
                .endAngle(0);
              svg.append("path")
                .attr("class", "moonOrbitPosition")
                .attr("d", moonOrbitPosition(now))
                .attr("transform", "translate(0," + -radii.planetOrbit + ")")
                .style("fill", "rgba(113, 170, 255, 0.75)");

              // Moon
              svg.append("circle")
                .attr("class", "moon")
                .attr("r", radii.moon)
                .attr("transform", "translate(0," + (-radii.planetOrbit + -radii.moonOrbit) + ")")
                .style("fill", "rgba(150, 150, 150, 1.0)");

              // Update the clock every second
              setInterval(function () {
                now = new Date();
                
                var interpolatePlanetOrbitPosition = d3.interpolate(planetOrbitPosition.endAngle()(), (2 * Math.PI * d3.time.hours(d3.time.year.floor(now), now).length / d3.time.hours(d3.time.year.floor(now), d3.time.year.ceil(now)).length));
                
                var interpolateDay = d3.interpolate(day.endAngle()(), (2 * Math.PI * d3.time.seconds(d3.time.day.floor(now), now).length / d3.time.seconds(d3.time.day.floor(now), d3.time.day.ceil(now)).length));
                
                var interpolateMoonOrbitPosition = d3.interpolate(moonOrbitPosition.endAngle()(), (2 * Math.PI * d3.time.hours(d3.time.month.floor(now), now).length / d3.time.hours(d3.time.month.floor(now), d3.time.month.ceil(now)).length));
                
                d3.transition().tween("orbit", function () {
                  return function (t) {
                    // Animate Planet orbit position
                    d3.select(".planetOrbitPosition").attr("d", planetOrbitPosition.endAngle(interpolatePlanetOrbitPosition(t)));

                    // Transition Planet
                    d3.select(".planet")
                      .attr("transform", "translate(" + radii.planetOrbit * Math.sin(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + "," + -radii.planetOrbit * Math.cos(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + ")");

                    // Animate day
                    // Transition day
                    d3.select(".day")
                      .attr("d", day.endAngle(interpolateDay(t)))
                      .attr("transform", "translate(" + radii.planetOrbit * Math.sin(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + "," + -radii.planetOrbit * Math.cos(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + ")");
                    
                    // Transition Moon orbit
                    d3.select(".moonOrbit")
                      .attr("transform", "translate(" + radii.planetOrbit * Math.sin(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + "," + -radii.planetOrbit * Math.cos(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + ")");

                    // Animate Moon orbit position
                    // Transition Moon orbit position
                    d3.select(".moonOrbitPosition")
                      .attr("d", moonOrbitPosition.endAngle(interpolateMoonOrbitPosition(t)))
                      .attr("transform", "translate(" + radii.planetOrbit * Math.sin(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + "," + -radii.planetOrbit * Math.cos(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + ")");
                    
                    // Transition Moon
                    d3.select(".moon")
                      .attr("transform", "translate(" + (radii.planetOrbit * Math.sin(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + radii.moonOrbit * Math.sin(interpolateMoonOrbitPosition(t) - moonOrbitPosition.startAngle()())) + "," + (-radii.planetOrbit * Math.cos(interpolatePlanetOrbitPosition(t) - planetOrbitPosition.startAngle()()) + -radii.moonOrbit * Math.cos(interpolateMoonOrbitPosition(t) - moonOrbitPosition.startAngle()())) + ")");
                  };
                });
              }, 1000); 
      });
    }
  });
  return PlanetView;
});