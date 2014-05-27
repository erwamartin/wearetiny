define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/solar_system.html'
], function($, _, Backbone, d3, SolarSystemTemplate){
  var SolarSystemView = Backbone.View.extend({
    el: $('#main'),
    initialize : function(){
    },

    render: function(params){

      var _this = this;

      var compiledTemplate = _.template( SolarSystemTemplate, params );
      _this.$el.html(compiledTemplate);

      $.getJSON('data/data.json', function(data){

        var solar_system = d3.select('.solar_system_orbits');
        var width = 600,
            height = 600,
            radius = Math.min(width, height)/2;

        var sun = {
          radius : radius*0.075
        }

        // Solar System
        var svg = solar_system.append("svg")
          .attr("width", width+(sun.radius*2))
          .attr("height", height+(sun.radius*2))
          .append("g")
            .attr("class", "solar_system_g")
            .attr("transform", "translate(" + (width+(sun.radius*2)) / 2 + "," + (height+(sun.radius*2)) / 2 + ")");

        // Sun
        svg.append("image")
          .attr("class", "sun")
          .attr("width", sun.radius*2)
          .attr("height", sun.radius*2)
          .attr("x",  - sun.radius)
          .attr("y",  - sun.radius)
          .attr("xlink:href", "assets/images/planets/sun.svg");

        for(var planet in data.planets){

          data.planets[planet].distance_px = radius*data.planets[planet].solar_system.distance_solar_coef;
          data.planets[planet].size_px = sun.radius*data.planets[planet].solar_system.size_coef;

          svg.append("circle")
            .attr("class", planet+"Orbit")
            .attr("r", data.planets[planet].distance_px)
            .attr("stroke-width", 2)
            .style("fill", "none")
            .style("stroke", "rgba(22, 68, 90, 0.75)");

          data.planets[planet].orbitPosition = d3.svg.arc()
            .outerRadius(data.planets[planet].distance_px + 1)
            .innerRadius(data.planets[planet].distance_px - 1)
            .startAngle(0)
            .endAngle(0);
          svg.append("path")
            .attr("class", planet+"OrbitPosition")
            .attr("d", data.planets[planet].orbitPosition)
            .style("fill", "rgba(22, 68, 90, 0.75)");

          // Planet
          svg.append("image")
            .attr("class", planet)
            .attr("width", data.planets[planet].size_px*2)
            .attr("height", data.planets[planet].size_px*2)
            .attr("x", -data.planets[planet].size_px)
            .attr("y", -data.planets[planet].size_px)
            .attr("transform", "translate(0," +(data.planets[planet].distance_px*-1)+ ")")
            .attr("xlink:href", "assets/images/planets/"+planet+".svg");
        }
        
        var now = new Date();

        _this.animation_timer = setInterval(function () {
          console.log('interval');
          d3.transition().duration(50).tween("orbit", function () {
              return function (t) {
                for(var planet in data.planets){

                  // Calculate the next angle
                  if(!d3.select("."+planet+"OrbitPosition").empty()){
                    var last_angle = parseFloat(d3.select("."+planet+"OrbitPosition").attr("angle")) || (2 * Math.PI * d3.time.hours(d3.time.year.floor(now), now).length / d3.time.hours(d3.time.year.floor(now), d3.time.year.ceil(now)).length);
                    var new_angle = last_angle + (1 /data.planets[planet].speed) /50;
                    d3.select("."+planet+"OrbitPosition").attr("angle", new_angle);

                    var orbitPosition = data.planets[planet].orbitPosition;
                    var interpolateOrbitPosition = d3.interpolate(orbitPosition.endAngle()(), new_angle);

                    // Animate Earth orbit position
                    d3.select("."+planet+"OrbitPosition").attr("d", orbitPosition.endAngle(interpolateOrbitPosition(t)));

                    // Transition Earth
                    d3.select("."+planet)
                      .attr("transform", "translate(" + data.planets[planet].distance_px * Math.sin(interpolateOrbitPosition(t) - data.planets[planet].orbitPosition.startAngle()()) + "," + -data.planets[planet].distance_px * Math.cos(interpolateOrbitPosition(t) - data.planets[planet].orbitPosition.startAngle()()) + ")");
                  }
                }
              }
            });
        }, 50); 
      });
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return SolarSystemView;
});