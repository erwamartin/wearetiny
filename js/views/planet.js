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

      d3.json('data/data.json', function(data){
          console.log(data);

        var now = new Date(d3.time.year.floor(new Date()));

        var spacetime = d3.select('.planet');
        var width = 960,
            height = 500,
            radius = Math.min(width, height);

        // Space
        var svg = spacetime.append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Sun

         var sun = {
          radius : radius*0.075
        }

        svg.append("circle")
          .attr("class", "sun")
          .attr("r", radius*0.075)
          .style("fill", "rgba(255, 204, 0, 1.0)");

              data.planets[params.planet].distance_px = radius*data.planets[params.planet].solar_system.distance_solar_coef;
              data.planets[params.planet].size_px = sun.radius*data.planets[params.planet].solar_system.size_coef;

              var radii = {
                "earthOrbit": data.planets[params.planet].distance_px,
                "earth": data.planets[params.planet].size_px ,
              };

              // Earth's orbit
              svg.append("circle")
                .attr("class", "earthOrbit")
                .attr("r", radii.earthOrbit)
                .style("fill", "none")
                .style("stroke", "rgba(255, 204, 0, 0.25)");

              // Current position of Earth in its orbit
              var earthOrbitPosition = d3.svg.arc()
                .outerRadius(radii.earthOrbit + 1)
                .innerRadius(radii.earthOrbit - 1)
                .startAngle(0)
                .endAngle(0);
              svg.append("path")
                .attr("class", "earthOrbitPosition")
                .attr("d", earthOrbitPosition)
                .style("fill", "rgba(255, 204, 0, 0.75)");

              // Earth
              svg.append("circle")
                .attr("class", "earth")
                .attr("r", radii.earth)
                .attr("transform", "translate(0," + -radii.earthOrbit + ")")
                .style("fill", "rgba(113, 170, 255, 1.0)");

              // Time of day
              var day = d3.svg.arc()
                .outerRadius(radii.earth)
                .innerRadius(0)
                .startAngle(0)
                .endAngle(0);
              svg.append("path")
                .attr("class", "day")
                .attr("d", day)
                .attr("transform", "translate(0," + -radii.earthOrbit + ")")
                .style("fill", "rgba(53, 110, 195, 1.0)");

        // Update the clock every second
        setInterval(function () {
          now = new Date();
          
          var interpolateEarthOrbitPosition = d3.interpolate(earthOrbitPosition.endAngle()(), (2 * Math.PI * d3.time.hours(d3.time.year.floor(now), now).length / d3.time.hours(d3.time.year.floor(now), d3.time.year.ceil(now)).length));
          
          var interpolateDay = d3.interpolate(day.endAngle()(), (2 * Math.PI * d3.time.seconds(d3.time.day.floor(now), now).length / d3.time.seconds(d3.time.day.floor(now), d3.time.day.ceil(now)).length));
                    
          d3.transition().tween("orbit", function (d, i) {
            console.log(d);
            console.log(i);
            return function (t) {
              //console.log('tween', t);
              // Animate Earth orbit position
              d3.select(".earthOrbitPosition").attr("d", earthOrbitPosition.endAngle(interpolateEarthOrbitPosition(t)));

              // Transition Earth
              d3.select(".earth")
                .attr("transform", "translate(" + radii.earthOrbit * Math.sin(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + "," + -radii.earthOrbit * Math.cos(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + ")");

              // Animate day
              // Transition day
              d3.select(".day")
                .attr("d", day.endAngle(interpolateDay(t)))
                .attr("transform", "translate(" + radii.earthOrbit * Math.sin(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + "," + -radii.earthOrbit * Math.cos(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + ")");
              
              // Transition Moon orbit
              d3.select(".moonOrbit")
                .attr("transform", "translate(" + radii.earthOrbit * Math.sin(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + "," + -radii.earthOrbit * Math.cos(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + ")");

            };
          });
        }, 1000);
    });
    }
  });
  return PlanetView;
});