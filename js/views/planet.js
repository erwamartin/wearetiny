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

      $.getJSON('data/data.json', function(data){

        params.planet_page = {
          planet : _this.get_planet_infos({
            translations : params.translations,
            functions : params.functions,
            planets : data.planets,
            spaceships : data.spaceships,
            planet_name : params.params.planet
          })
        }

        /******************************************/
        //                  Calendar              //
        /******************************************/

        var compiledTemplate = _.template( PlanetTemplate, params );
         _this.$el.html(compiledTemplate);

          var space_time = {
            svg_element : d3.select('.calendar-graph'),
            params : {
              width : ($('.calendar').innerWidth()-10),
              height : ($('.calendar').innerHeight()-10),
            }
          }
          space_time.params.radius = Math.min(space_time.params.width, space_time.params.height)/2;

          var now = new Date(d3.time.year.floor(new Date()));


          var radii = {
            "sun": space_time.params.radius / 4,
            "planetOrbit": space_time.params.radius / 1.875,
            "planet": space_time.params.radius / 9,
          };

          // Space
          space_time.svg = space_time.svg_element.append("svg")
            .attr("width", space_time.params.width)
            .attr("height", space_time.params.height)
            .append("g")
              .attr("transform", "translate(" + space_time.params.width / 2 + "," + space_time.params.height / 2 + ")");

          // Sun
           space_time.svg.append("image")
            .attr("class", "sun")
            .attr("width", radii.sun*2)
            .attr("height", radii.sun*2)
            .attr("x",  - radii.sun)
            .attr("y",  - radii.sun)
            .attr("xlink:href", "assets/images/planets/sun.svg");

          data.planets[params.params.planet].distance_px = space_time.params.radius*data.planets[params.params.planet].solar_system.distance_solar_coef;
          data.planets[params.params.planet].size_px = radii.sun*data.planets[params.params.planet].solar_system.size_coef;

          // Earth's orbit
          space_time.svg.append("circle")
            .attr("class", "planetOrbit")
            .attr("r", radii.planetOrbit)
            .style("fill", "none")
            .style("stroke", "rgba(255, 255, 255, 0.75)");

          data.planets[params.params.planet].orbitPosition = d3.svg.arc()
            .outerRadius(data.planets[params.params.planet].distance_px + 1)
            .innerRadius(data.planets[params.params.planet].distance_px - 1)
            .startAngle(0)
            .endAngle(0);

          // Current position of Earth in its orbit
          var planetOrbitPosition = d3.svg.arc()
            .outerRadius(radii.planetOrbit + 1)
            .innerRadius(radii.planetOrbit - 1)
            .startAngle(0)
            .endAngle(0);
          space_time.svg.append("path")
            .attr("class", "planetOrbitPosition")
            .attr("d", planetOrbitPosition)
            .style("fill", "rgba(255, 204, 0, 0.75)");

          // Earth
          space_time.svg.append("circle")
            .attr("class", "planet")
            .attr("r", radii.planet)
            .attr("transform", "translate(0," + -radii.planetOrbit + ")")
            .style("fill", data.planets[params.params.planet].color2);

          // Time of day
          var day = d3.svg.arc()
            .outerRadius(radii.planet)
            .innerRadius(0)
            .startAngle(0)
            .endAngle(0);
          space_time.svg.append("path")
            .attr("class", "day")
            .attr("d", day)
            .attr("transform", "translate(0," + -radii.planetOrbit + ")")
            .style("fill", data.planets[params.params.planet].color1);

        var origin = new Date(2014, 0, 1, 1, 0, 0, 0);
        var now = new Date();

        _this.animation_timer = setInterval(function () {
          d3.transition().duration(50).tween("orbit", function () {
              return function (t) {

                  // Calculate the next angle
                  if(!d3.select(".planetOrbitPosition").empty()){
                    var last_angle = ((newAngle(origin, now, data.planets[params.params.planet].revolution_period, data.planets[params.params.planet].sun_angle)*6.28)/360);
                    var new_angle = last_angle;

                    var last_angle_day = ((newAngle(origin, now, data.planets[params.params.planet].rotation, 0)*6.28)/360);
                    var new_angle_day = last_angle_day;
                    d3.select(".planetOrbitPosition").attr("angle", new_angle);

                    var orbitPosition = planetOrbitPosition;
                    var interpolateOrbitPosition = d3.interpolate(orbitPosition.endAngle()(), new_angle);

                    var interpolatePlanetDay = d3.interpolate(day.endAngle()(), new_angle_day);

                    // Animate Planet orbit position
                    d3.select(".planetOrbitPosition").attr("d", orbitPosition.endAngle(interpolateOrbitPosition(t)));

                    // Transition Planet
                    d3.select(".planet")
                      .attr("transform", "translate(" + radii.planetOrbit * Math.sin(interpolateOrbitPosition(t) - planetOrbitPosition.startAngle()()) + "," + -radii.planetOrbit * Math.cos(interpolateOrbitPosition(t) - planetOrbitPosition.startAngle()()) + ")");
                      // .attr("transform", "translate(" + radii.earthOrbit * Math.sin(interpolateOrbitPosition(t) - earthOrbitPosition.startAngle()()) + "," + -radii.earthOrbit * Math.cos(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + ")");

                    // Animate day
                    // Transition day
                    d3.select(".day")
                      .attr("d", day.endAngle(interpolatePlanetDay(t)))
                      .attr("transform", "translate(" + radii.planetOrbit * Math.sin(interpolateOrbitPosition(t) - planetOrbitPosition.startAngle()()) + "," + -radii.planetOrbit * Math.cos(interpolateOrbitPosition(t) - planetOrbitPosition.startAngle()()) + ")");
                      }
                
              }
            });
        }, 50); 
          
        /******************************************/
        //                  Area                  //
        /******************************************/

/*          var data = [
            {name: "planet",    value:  data.planets[params.params.planet].size},
            {name: "earth",     value: data.planets["earth"].size }
          ];


          var area = {
            svg_element : d3.select('.area-graph'),
            params : {
              width : ($('.area').innerWidth()-20),
              height : ($('.area').innerHeight()-95),
            }
          }

          var y = d3.scale.linear()
              .range([area.params.height, 0]) 
              .domain([0, d3.max(data, function(d) { return d.value; })]);

         area.svg = area.svg_element.append("svg")
              .attr("width", area.params.width)
              .attr("height", area.params.height);

          var barWidth = 112;

          var bar = area.svg.selectAll("g")
              .data(data)
              .enter().append("g")
              .attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

          bar.append("rect")
              .attr("x", 45)
              .attr("y", function(d) { return y(d.value); })
              .attr("height", function(d) { return area.params.height - y(d.value); })
              .attr("width", barWidth - 4);
              d3.max(data, function(d) { return area.params.height - y(d.value); })

          bar.append("rect")
             
              .attr("y",  d3.max(data, function(d) { return area.params.height - y(d.value); })-3)
              .attr("height", 2 )
              .attr("width", 290)
              .style("fill", "rgba(255, 255, 255,  1)")
              .style("stroke", "rgba(255, 255, 255,  1)");

          function type(d) {
            d.value = +d.value; // coerce to number
            return d;
          }*/


          /******************************************/
        //                  Area                  //
        /******************************************/


        
      });
    },
    get_planet_infos : function(params){
      return {
        left_planet : (((params.planets[params.planet_name].distance_earth/params.spaceships.NewHorizons)/24)/30),
        age : (Math.round(parseFloat(localStorage.getItem("age")))+(Math.round((((params.planets[params.planet_name].distance_earth/params.spaceships.NewHorizons)/24)/30)/12))),
        weight : Math.round(((parseFloat(localStorage.getItem("weight")))/params.planets['earth'].gravity)*params.planets[params.planet_name].gravity),
        temperature : params.planets[params.planet_name].temperature
        //(poidsUtilisateur/graviteTerre)*gravitePlanete
          //((distanceDepuisTerre/vitesseVaisseau)/24)/30
      };
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return PlanetView;
});