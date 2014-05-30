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


        /******************************************/
        //               Solar System             //
        /******************************************/

        var solar_system = {
          svg_element : d3.select('.solar_system_orbits'),
          params : {
            width : ($('body').innerWidth()-$('.left_sidebar').innerWidth()-$('.right_sidebar').innerWidth())*80/100,
            height : (($('body').innerHeight()-$('h2').innerHeight()-$('h3').innerHeight())-100)*85/100,
          }
        }
        solar_system.params.radius = Math.min(solar_system.params.width, solar_system.params.height)/2;

        var sun = {
          radius : solar_system.params.radius*0.075
        }

        // Solar System
        solar_system.svg = solar_system.svg_element.append("svg")
          .attr("width", solar_system.params.width+(sun.radius*2))
          .attr("height", solar_system.params.height+(sun.radius*2))
          .append("g")
            .attr("class", "solar_system_g")
            .attr("transform", "translate(" + (solar_system.params.width+(sun.radius*2)) / 2 + "," + (solar_system.params.height+(sun.radius*2)) / 2 + ")");

        // Sun
        solar_system.svg.append("image")
          .attr("class", "sun")
          .attr("width", sun.radius*2)
          .attr("height", sun.radius*2)
          .attr("x",  - sun.radius)
          .attr("y",  - sun.radius)
          .attr("xlink:href", "assets/images/planets/sun.svg");

        for(var planet in data.planets){

          data.planets[planet].distance_px = solar_system.params.radius*data.planets[planet].solar_system.distance_solar_coef;
          data.planets[planet].size_px = sun.radius*data.planets[planet].solar_system.size_coef;

          solar_system.svg.append("circle")
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
          solar_system.svg.append("path")
            .attr("class", planet+"OrbitPosition")
            .attr("d", data.planets[planet].orbitPosition)
            .style("fill", "rgba(22, 68, 90, 0.75)");

          // Planet
          solar_system.svg.append("image")
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


        /******************************************/
        //              distance_scales            //
        /******************************************/
        var distance_scales = {
          svg_element : d3.select('.distance_scales .svg'),
          params : {
            innerWidth : $('body').innerWidth()*80/100,
            height : 100
          },
          points : {
            number : 60,
            radius : 2.5
          },
          sun : {
            radius : 28
          },
          planets : {
            radius : 7.5
          }
        }

        distance_scales.params.width = distance_scales.params.innerWidth + distance_scales.sun.radius*2;

        // distance_scales
        distance_scales.svg = distance_scales.svg_element.append("svg")
          .attr("width", distance_scales.params.width)
          .attr("height", distance_scales.params.height)
          .append("g")
            .attr("class", "distance_scales_g")
            .attr("transform", "translate("+ distance_scales.sun.radius +"," + distance_scales.params.height / 2 + ")");

        distance_scales.params.distance_first_point = distance_scales.sun.radius+(distance_scales.params.innerWidth/distance_scales.points.number-distance_scales.points.radius/2);

        // Points
        for(var cpt=0; cpt<60; cpt++){
          distance_scales.svg.append("circle")
            .attr("class", "point")
            .attr("r", distance_scales.points.radius)
            .attr("transform", "translate(" + ((((distance_scales.params.innerWidth-distance_scales.params.distance_first_point)/distance_scales.points.number)*cpt)+distance_scales.points.radius+distance_scales.params.distance_first_point) + ", 0)")
            .style("fill", "rgba(156, 163, 157, 1.0)");
        }

        // Sun
        distance_scales.svg.append("circle")
            .attr("class", "sun")
            .attr("r", distance_scales.sun.radius)
            .style("fill", "rgba(255, 215, 71, 1.0)");

        //distance_scales.params.coef_size = (distance_scales.sun.radius*2/data.sun.size);
        distance_scales.params.coef_distance = (distance_scales.params.innerWidth-distance_scales.sun.radius)/data.planets['neptune'].distance_solar;

        for(var planet in data.planets){
          distance_scales.svg.append("circle")
            .attr("class", planet)
            //.attr("r", distance_scales.sun.radius*data.planets[planet].solar_system.size_coef)
            .attr("r", distance_scales.planets.radius)
            .attr("transform", "translate(" + ((data.planets[planet].distance_solar*distance_scales.params.coef_distance)+distance_scales.sun.radius) + ", 0)")
            .style("fill", data.planets[planet].color1);
        }

      });
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return SolarSystemView;
});