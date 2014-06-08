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

      $('.right_sidebar li a').on('click', function(evt){
        if(!localStorage.getItem('user') && $(this).parents('li').attr('class')!='compare'){
          evt.preventDefault();
          $('.boarding_pass').addClass('on');
          $('.boarding_pass .modal .planet_code').text($(this).parents('li').attr('class').substring(0, 3));
          $('.boarding_pass .modal a#travel').attr('href', $(this).attr('href'));
        }
      });

      $('.boarding_pass').on('click', function(evt){
        if( evt.target !== this ) return;
        $('.boarding_pass').removeClass('on');
      });

      $('.boarding_pass .modal input[type="text"]').on('focus', function(evt){
        $(this).data('placeholder', $(this).attr('placeholder'));
        $(this).attr('placeholder', '');
      });

      $('.boarding_pass .modal input[type="text"]').on('blur', function(evt){
        $(this).attr('placeholder', $(this).data('placeholder'));
      });

      $('.boarding_pass .modal #travel').on('click', function(evt){
        var age = Math.parseInt($('.boarding_pass .modal input[type="age"]').val());
        var weight = Math.parseInt($('.boarding_pass .modal input[type="weight"]').val());
        var transportation = $('.boarding_pass .modal input[type="weight"]').val();
        if(age<1 || age>122){
          
        }else if(weight<1 || weight>600){
          
        }
        evt.preventDefault();

      });

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
        
        var origin = new Date(2014, 0, 1, 1, 0, 0, 0);
        console.log(origin);
        var now = new Date();

        _this.animation_timer = setInterval(function () {
          d3.transition().duration(50).tween("orbit", function () {
              return function (t) {
                for(var planet in data.planets){

                  // Calculate the next angle
                  if(!d3.select("."+planet+"OrbitPosition").empty()){
                    var last_angle = parseFloat(d3.select("."+planet+"OrbitPosition").attr("angle")) || ((newAngle(origin, now, data.planets[planet].revolution_period, data.planets[planet].sun_angle)*6.28)/360);
                    var new_angle = last_angle + (1 /(data.planets[planet].revolution_period/365.2)) /50;

                    d3.select("."+planet+"OrbitPosition").attr("angle", new_angle);

                    var orbitPosition = data.planets[planet].orbitPosition;
                    var interpolateOrbitPosition = d3.interpolate(orbitPosition.endAngle()(), new_angle);

                    // Animate Planet orbit position
                    d3.select("."+planet+"OrbitPosition").attr("d", orbitPosition.endAngle(interpolateOrbitPosition(t)));

                    // Transition Planet
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
        for(var cpt=0; cpt<distance_scales.points.number; cpt++){
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

function newAngle(origin, now, rotation, oldAngle){
  timeInterval = (now.getTime() - origin.getTime())/(1000*3600*24); //temps en jours
  return (oldAngle+((timeInterval*360)/rotation))%360;
}