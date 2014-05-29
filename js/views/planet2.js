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
      var _this = this;

      var compiledTemplate = _.template( PlanetTemplate, params );
       _this.$el.html(compiledTemplate);
       
      $.getJSON('data/data.json', function(data){
        console.log(data);


        /******************************************/
        //                  Planet                //
        /******************************************/

        var now = new Date(d3.time.year.floor(new Date()));

        var space_time = {
          svg_element : d3.select('.planet_orbit'),
          params : {
            width : ($('body').innerWidth()-$('.left_sidebar').innerWidth()-$('.right_sidebar').innerWidth())*80/100,
            height : (($('body').innerHeight()-$('h2').innerHeight()-$('h3').innerHeight())-100)*40/100,
          }
        }
        space_time.params.radius = Math.min(space_time.params.width, space_time.params.height)/2;

        var sun = {
          radius : space_time.params.radius*0.075
        }

        // Solar System
        space_time.svg = space_time.svg_element.append("svg")
          .attr("width", space_time.params.width+(sun.radius*2))
          .attr("height", space_time.params.height+(sun.radius*2))
          .append("g")
            .attr("class", "space_time_g")
            .attr("transform", "translate(" + (space_time.params.width+(sun.radius*2)) / 2 + "," + (space_time.params.height+(sun.radius*2)) / 2 + ")");

        // Sun
        space_time.svg.append("image")
          .attr("class", "sun")
          .attr("width", sun.radius*2)
          .attr("height", sun.radius*2)
          .attr("x",  - sun.radius)
          .attr("y",  - sun.radius)
          .attr("xlink:href", "assets/images/planets/sun.svg");

        data.planets[params.params.planet].distance_px = space_time.params.radius*data.planets[params.params.planet].solar_system.distance_solar_coef;
        data.planets[params.params.planet].size_px = sun.radius*data.planets[params.params.planet].solar_system.size_coef;

        var radii = {
          "planetOrbit": data.planets[params.params.planet].distance_px,
          "planet": data.planets[params.params.planet].size_px ,
        };

        space_time.svg.append("circle")
            .attr("class", params.params.planet+"Orbit")
            .attr("r",  data.planets[params.params.planet].distance_px)
            .attr("stroke-width", 2)
            .style("fill", "none")
            .style("stroke", "rgba(22, 68, 90, 0.75)");

          data.planets[params.params.planet].orbitPosition = d3.svg.arc()
            .outerRadius(data.planets[params.params.planet].distance_px + 1)
            .innerRadius(data.planets[params.params.planet].distance_px - 1)
            .startAngle(0)
            .endAngle(0);
          space_time.svg.append("path")
            .attr("class", params.params.planet+"OrbitPosition")
            .attr("d", data.planets[params.params.planet].orbitPosition)
            .style("fill", "rgba(22, 68, 90, 0.75)");



          // Earth
          space_time.svg.append("circle")
            .attr("class",  params.params.planet)
            .attr("r", data.planets[params.params.planet].size_px)
            .attr("transform", "translate(0," + -data.planets[params.params.planet].distance_px + ")")
            .style("fill", "rgba(113, 170, 255, 1.0)");

        // Time of day
        var day = d3.svg.arc()
          .outerRadius(data.planets[params.params.planet].size_px)
          .innerRadius(0)
          .startAngle(0)
          .endAngle(0);
        space_time.svg.append("path")
          .attr("class", "day")
          .attr("d", day)
          .attr("transform", "translate(0," + -data.planets[params.params.planet].distance_px + ")")
          .style("fill", "rgba(53, 110, 195, 1.0)");


        // Update the clock every second
        _this.animation_timer = setInterval(function () {
          now = new Date();

          var orbitPosition = data.planets[params.params.planet].orbitPosition;
          var interpolateOrbitPosition = d3.interpolate(orbitPosition.endAngle()(), (2 * Math.PI * d3.time.hours(d3.time.year.floor(now), now).length / d3.time.hours(d3.time.year.floor(now), d3.time.year.ceil(now)).length));
          var interpolateDay = d3.interpolate(day.endAngle()(), (2 * Math.PI * d3.time.seconds(d3.time.day.floor(now), now).length / d3.time.seconds(d3.time.day.floor(now), d3.time.day.ceil(now)).length));
                    
          d3.transition().duration(1000).tween("orbit", function (d, i) {
            return function (t) {
              // Animate Earth orbit position
              d3.select("."+params.params.planet+"OrbitPosition").attr("d", orbitPosition.endAngle(interpolateOrbitPosition(t)));

              // Transition Earth
              d3.select("."+params.params.planet)
                .attr("transform", "translate(" + data.planets[params.params.planet].distance_px * Math.sin(interpolateOrbitPosition(t) - orbitPosition.startAngle()()) + "," + -data.planets[params.params.planet].distance_px * Math.cos(interpolateOrbitPosition(t) - orbitPosition.startAngle()()) + ")");

              // Animate day
              // Transition day
              d3.select(".day")
                .attr("d", day.endAngle(interpolateDay(t)))
                .attr("transform", "translate(" + data.planets[params.params.planet].distance_px * Math.sin(interpolateOrbitPosition(t) - orbitPosition.startAngle()()) + "," + -data.planets[params.params.planet].distance_px * Math.cos(interpolateOrbitPosition(t) - orbitPosition.startAngle()()) + ")");
              
            };
          });
        }, 1000);
    });
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return PlanetView;
});