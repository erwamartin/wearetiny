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

      var _this = params._this = this;

      $.getJSON('data/data.json', function(data){

        params.data = data;
        params.earth_to_end_univers = data.planets.earth.univers_end;

        // Default spacecraft
        if(!localStorage.getItem('transportation')){
          localStorage.setItem('transportation', 'SpaceShipTwo');
        }
        params.transportation = {
          id : localStorage.getItem('transportation'),
        };
        params.transportation.duration = _this.getDurationTrip.call(this, params);

        var compiledTemplate = _.template( SolarSystemTemplate, params );
        _this.$el.html(compiledTemplate);

        _this.render_graph.call(this, params);

      });
    },
    render_graph: function(params){

      var _this = params._this;

      $('.vehicules input[name="transportation"]').on('click', function(){
        var transportation = $(this).val();
        localStorage.setItem('transportation', transportation);
        $('.boarding_pass .modal input[name="transportation"][value="'+transportation+'"]').prop('checked', true);
        params.transportation.id = transportation;
        params.transportation.duration = _this.getDurationTrip.call(this, params);
        _this.setTransportation.call(this, params);
      });

      $('.right_sidebar li a').on('click', function(evt){
        if((!localStorage.getItem('age') || !localStorage.getItem('weight') || !localStorage.getItem('transportation')) && $(this).parents('li').attr('class')!='compare'){
          evt.preventDefault();
          $('.boarding_pass').addClass('on');
          $('.boarding_pass .modal .planet_code').text($(this).parents('li').attr('class').substring(0, 3));
          $('.boarding_pass .modal form').attr('data-action', $(this).attr('href'));
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

      $('.boarding_pass .modal form').on('submit', function(evt){
        evt.preventDefault();

        $('.boarding_pass .modal div').removeClass('error');
        var age = parseInt($('.boarding_pass .modal input[name="age"]').val());
        var weight = parseInt($('.boarding_pass .modal input[name="weight"]').val());
        var transportation = $('.boarding_pass .modal input[name="transportation"]:checked').val();
        if(isNaN(age) || age<1 || age>122){
          $('.boarding_pass .modal div.age').addClass('error');
        }else if(isNaN(weight) || weight<1 || weight>600){
          $('.boarding_pass .modal div.weight').addClass('error');
        }else{
          localStorage.setItem('age', age);
          localStorage.setItem('weight', weight);
          localStorage.setItem('transportation', transportation);
          window.location.href = $(this).data('action');
        }
      });


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

      for(var planet in params.data.planets){

        params.data.planets[planet].distance_px = solar_system.params.radius*params.data.planets[planet].solar_system.distance_solar_coef;
        params.data.planets[planet].size_px = sun.radius*params.data.planets[planet].solar_system.size_coef;

        solar_system.svg.append("circle")
          .attr("class", planet+"Orbit")
          .attr("r", params.data.planets[planet].distance_px)
          .attr("stroke-width", 2)
          .style("fill", "none")
          .style("stroke", "rgba(22, 68, 90, 0.75)");

        params.data.planets[planet].orbitPosition = d3.svg.arc()
          .outerRadius(params.data.planets[planet].distance_px + 1)
          .innerRadius(params.data.planets[planet].distance_px - 1)
          .startAngle(0)
          .endAngle(0);

        solar_system.svg.append("path")
          .attr("class", planet+"OrbitPosition")
          .attr("d", params.data.planets[planet].orbitPosition)
          .style("fill", "rgba(22, 68, 90, 0.75)");

        // Planet
        solar_system.svg.append("image")
          .attr("class", planet)
          .attr("width", params.data.planets[planet].size_px*2)
          .attr("height", params.data.planets[planet].size_px*2)
          .attr("x", -params.data.planets[planet].size_px)
          .attr("y", -params.data.planets[planet].size_px)
          .attr("transform", "translate(0," +(params.data.planets[planet].distance_px*-1)+ ")")
          .attr("xlink:href", "assets/images/planets/"+planet+".svg");
      }
      
      var origin = new Date(2014, 0, 1, 1, 0, 0, 0);
      var now = new Date();

      _this.animation_timer = setInterval(function () {
        d3.transition().duration(50).tween("orbit", function () {
            return function (t) {
              for(var planet in params.data.planets){

                // Calculate the next angle
                if(!d3.select("."+planet+"OrbitPosition").empty()){
                  var last_angle = parseFloat(d3.select("."+planet+"OrbitPosition").attr("angle")) || ((newAngle(origin, now, params.data.planets[planet].revolution_period, params.data.planets[planet].sun_angle)*6.28)/360);
                  var new_angle = last_angle + (1 /(params.data.planets[planet].revolution_period/365.2)) /50;

                  d3.select("."+planet+"OrbitPosition").attr("angle", new_angle);

                  var orbitPosition = params.data.planets[planet].orbitPosition;
                  var interpolateOrbitPosition = d3.interpolate(orbitPosition.endAngle()(), new_angle);

                  // Animate Planet orbit position
                  d3.select("."+planet+"OrbitPosition").attr("d", orbitPosition.endAngle(interpolateOrbitPosition(t)));

                  // Transition Planet
                  d3.select("."+planet)
                    .attr("transform", "translate(" + params.data.planets[planet].distance_px * Math.sin(interpolateOrbitPosition(t) - params.data.planets[planet].orbitPosition.startAngle()()) + "," + -params.data.planets[planet].distance_px * Math.cos(interpolateOrbitPosition(t) - params.data.planets[planet].orbitPosition.startAngle()()) + ")");
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
      distance_scales.params.coef_distance = (distance_scales.params.innerWidth-distance_scales.sun.radius)/params.data.planets['neptune'].distance_solar;

      for(var planet in params.data.planets){
        distance_scales.svg.append("circle")
          .attr("class", planet)
          .attr("r", distance_scales.planets.radius)
          .attr("transform", "translate(" + ((params.data.planets[planet].distance_solar*distance_scales.params.coef_distance)+distance_scales.sun.radius) + ", 0)")
          .style("fill", params.data.planets[planet].color1);
      }

      // Hide loader
      setTimeout(function() {
        $('#loader').fadeOut()
      }, 3000);
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    },
    getDurationTrip : function(params){
      return Math.round(((params.earth_to_end_univers/params.data.spaceships[params.transportation.id].speed)/24/30)*100)/100;
    },
    setTransportation : function(params){
      $('.transportation .vehicule span').text(params.transportation.id);
      $('.transportation .duration span').text(params.transportation.duration);
    }
  });
  return SolarSystemView;
});

function newAngle(origin, now, rotation, oldAngle){
  timeInterval = (now.getTime() - origin.getTime())/(1000*3600*24); //temps en jours
  return (oldAngle+((timeInterval*360)/rotation))%360;
}
