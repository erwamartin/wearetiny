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
      _this.interval_timers = [];

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

      $('.boarding_pass, .boarding_pass .close').on('click', function(evt){
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

        $('.boarding_pass .modal div').removeClass('error_message');
        var age = parseInt($('.boarding_pass .modal input[name="age"]').val());
        var weight = parseInt($('.boarding_pass .modal input[name="weight"]').val());
        var transportation = $('.boarding_pass .modal input[name="transportation"]:checked').val();
        if(isNaN(age) || age<1 || age>122){
          $('.boarding_pass .modal div.age').addClass('error_message');
        }else if(isNaN(weight) || weight<1 || weight>600){
          $('.boarding_pass .modal div.weight').addClass('error_message');
        }else{
          localStorage.setItem('age', age);
          localStorage.setItem('weight', weight);
          localStorage.setItem('transportation', transportation);
          window.location.href = $(this).data('action');
        }
      });

      var distance_comparison_id = 0;
      var timer = setInterval(function(){
        distance_comparison_id++;
        if(distance_comparison_id>params.translations.views.solar_system.distances_comparisons.length) distance_comparison_id=0;
        var new_distance_comparison = params.functions.formatNumber(params.translations.views.solar_system.distances_comparisons[distance_comparison_id], params.translations.views.global.number_separator);
        $(".distances_comparisons").fadeOut(function() {
          $(this).html(new_distance_comparison)
        }).fadeIn();
      }, 5000);
      _this.interval_timers.push(timer);


      /******************************************/
      //               Solar System             //
      /******************************************/

      var solar_system = {
        svg_element : d3.select('.solar_system_orbits'),
        params : {
          width : ($('body').innerWidth()-$('.left_sidebar').innerWidth()-$('.right_sidebar').innerWidth())*80/100,
          height : (($('body').innerHeight()-$('h2').innerHeight()-$('h3').innerHeight())-100)*85/100,
          margin : {}
        },
        planet_infos : {
          width : 160,
          height : 130
        }
      }
      solar_system.params.radius = Math.min(solar_system.params.width, solar_system.params.height)/2;
      solar_system.params.margin.left = solar_system.params.margin.right = ($('body').innerWidth()-solar_system.params.width)/2;

      var sun = {
        radius : solar_system.params.radius*0.075
      }

      // Solar System
      var solar_system_svg_params = {
        width : solar_system.params.width+(sun.radius*2)+solar_system.params.margin.left+solar_system.params.margin.right,
        height : solar_system.params.height+(sun.radius*2),
        x : (((solar_system.params.width+(sun.radius*2)) / 2) + solar_system.params.margin.left),
        y : (solar_system.params.height+(sun.radius*2)) / 2
      }
      solar_system.svg = solar_system.svg_element.append("svg")
        .attr("width", solar_system_svg_params.width)
        .attr("height", solar_system_svg_params.height);
      solar_system.g = solar_system.svg.append("g")
          .attr("class", "solar_system_g")
          .attr("transform", "translate(" + solar_system_svg_params.x + "," + solar_system_svg_params.y + ")");

      // Sun
      solar_system.g.append("image")
        .attr("class", "sun")
        .attr("width", sun.radius*2)
        .attr("height", sun.radius*2)
        .attr("x",  - sun.radius)
        .attr("y",  - sun.radius)
        .attr("xlink:href", "assets/images/planets/sun.svg");

      var planet_infos_params = {
        x : solar_system_svg_params.x+solar_system.params.radius*params.data.planets['neptune'].solar_system.distance_solar_coef,
        y : solar_system_svg_params.y,
        margin : {
          left : 15,
          top : 15
        }
      }
      planet_infos_params.x += (($('body').innerWidth()-planet_infos_params.x)-$('.right_sidebar').innerWidth()*2)/2;
      planet_infos_params.x -= solar_system.planet_infos.width/2;
      planet_infos_params.y -= solar_system.planet_infos.height/2;

      $('.solar_system .planet_infos').css({
        top :  planet_infos_params.y,
        left :  planet_infos_params.x
      });

       solar_system.display_planet_info = function(params){
          $('.solar_system .planet_infos .planet_name').text(params.planet_name);
          $('.solar_system .planet_infos .rotation_speed_value span').text(params.rotation_speed_value);
          $('.solar_system .planet_infos .rotation_speed_duration span').text(params.rotation_speed_duration);
          $('.solar_system .planet_infos').addClass('on');
       } 

       solar_system.hide_planet_info = function(params){
          $('.solar_system .planet_infos').removeClass('on');
       } 


      for(var planet in params.data.planets){

        params.data.planets[planet].distance_px = solar_system.params.radius*params.data.planets[planet].solar_system.distance_solar_coef;
        params.data.planets[planet].size_px = sun.radius*params.data.planets[planet].solar_system.size_coef;

        solar_system.g.append("circle")
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

        solar_system.g.append("path")
          .attr("class", planet+"OrbitPosition")
          .attr("d", params.data.planets[planet].orbitPosition)
          .style("fill", "rgba(22, 68, 90, 0.75)");

        solar_system.g.append("circle")
          .attr("class", planet+"Orbit")
          .attr("data-planet", planet)
          .attr("r", params.data.planets[planet].distance_px)
          .attr("stroke-width", 20)
          .style("fill", "none")
          .style("stroke", "rgba(22, 68, 90, 0.75)")
          .attr("stroke-opacity", 0)
          .on('mouseover', function(){
            var planet_name = d3.select(this).attr('data-planet');
            solar_system.display_planet_info.call(this, {
              planet_name : params.translations.views.planets[planet_name].planet_name,
              rotation_speed_value : params.data.planets[planet_name].speed,
              rotation_speed_duration : params.data.planets[planet_name].revolution_period
            });
          })
          .on('mouseout', function(){
            solar_system.hide_planet_info.call(this);
          });


        // Planet
        solar_system.g.append("image")
          .attr("class", planet)
          .attr("width", params.data.planets[planet].size_px*2)
          .attr("height", params.data.planets[planet].size_px*2)
          .attr("data-planet", planet)
          .attr("x", -params.data.planets[planet].size_px)
          .attr("y", -params.data.planets[planet].size_px)
          .attr("transform", "translate(0," +(params.data.planets[planet].distance_px*-1)+ ")")
          .attr("xlink:href", "assets/images/planets/"+planet+".svg")
          .on('mouseover', function(){
            var planet_name = d3.select(this).attr('data-planet');
            solar_system.display_planet_info.call(this, {
              planet_name : params.translations.views.planets[planet_name].planet_name,
              rotation_speed_value : params.data.planets[planet_name].speed,
              rotation_speed_duration : params.data.planets[planet_name].revolution_period
            });
          })
          .on('mouseout', function(){
            solar_system.hide_planet_info.call(this);
          });

      }
      
      var origin = new Date(2014, 0, 1, 1, 0, 0, 0);
      var now = new Date();

      var timer = setInterval(function () {
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
      _this.interval_timers.push(timer);


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

      distance_scales.params.coef_distance = (distance_scales.params.innerWidth-distance_scales.sun.radius)/params.data.planets['neptune'].distance_solar;

      // Hide loader
      setTimeout(function() {
        $('#loader').fadeOut(300, function(){

          // Points
          for(var cpt=0; cpt<distance_scales.points.number; cpt++){
            distance_scales.svg.append("circle")
              .attr("class", "point")
              .attr("r", distance_scales.points.radius)
              .style("fill", "rgba(156, 163, 157, 1.0)")
              .transition('bounce')
              .duration(1500)
              .attr("transform", "translate(" + ((((distance_scales.params.innerWidth-distance_scales.params.distance_first_point)/distance_scales.points.number)*cpt)+distance_scales.points.radius+distance_scales.params.distance_first_point) + ", 0)");
          }

          var planets_counter = 0;
          for(var planet in params.data.planets){
            var planet_circle = distance_scales.svg.append("circle")
              .attr("class", planet)
              .attr("r", distance_scales.planets.radius)
              .style("fill", params.data.planets[planet].color1);

            planet_circle         
              .transition('bounce')
              .duration(1500)
              .attr("transform", "translate(" + ((params.data.planets[planet].distance_solar*distance_scales.params.coef_distance)+distance_scales.sun.radius) + ", 0)");
            
            planets_counter++;
          }
          // Sun
          distance_scales.svg.append("circle")
          .attr("class", "sun")
          .attr("r", distance_scales.sun.radius)
          .style("fill", "rgba(255, 215, 71, 1.0)");
        });
      }, 1500);
    },
    close: function(view){
      if(view.interval_timers.length>0){
        for(var i in view.interval_timers){
          clearInterval(view.interval_timers[i]);
        }
      }
      view.interval_timers = [];
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
