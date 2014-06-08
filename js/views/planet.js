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
            "earthOrbit": space_time.params.radius / 1.875,
            "earth": space_time.params.radius / 9,
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

          // Earth's orbit
          space_time.svg.append("circle")
            .attr("class", "earthOrbit")
            .attr("r", radii.earthOrbit)
            .style("fill", "none")
            .style("stroke", "rgba(255, 255, 255, 0.75)");

          // Current position of Earth in its orbit
          var earthOrbitPosition = d3.svg.arc()
            .outerRadius(radii.earthOrbit + 1)
            .innerRadius(radii.earthOrbit - 1)
            .startAngle(0)
            .endAngle(0);
          space_time.svg.append("path")
            .attr("class", "earthOrbitPosition")
            .attr("d", earthOrbitPosition)
            .style("fill", "rgba(255, 204, 0, 0.75)");

          // Earth
          space_time.svg.append("circle")
            .attr("class", "earth")
            .attr("r", radii.earth)
            .attr("transform", "translate(0," + -radii.earthOrbit + ")")
            .style("fill", data.planets[params.params.planet].color2);

          // Time of day
          var day = d3.svg.arc()
            .outerRadius(radii.earth)
            .innerRadius(0)
            .startAngle(0)
            .endAngle(0);
          space_time.svg.append("path")
            .attr("class", "day")
            .attr("d", day)
            .attr("transform", "translate(0," + -radii.earthOrbit + ")")
            .style("fill", data.planets[params.params.planet].color1);


          // Update the clock every second
          _this.animation_timer = setInterval(function () {
            now = new Date();
            var origin = new Date(2014, 0, 1, 1, 0, 0, 0);

            //var interpolateEarthOrbitPosition = d3.interpolate(earthOrbitPosition.endAngle()(), (2 * Math.PI * d3.time.hours(d3.time.year.floor(now), now).length / d3.time.hours(d3.time.year.floor(now), d3.time.year.ceil(now)).length));
            
            var interpolateDay = d3.interpolate(day.endAngle()(), (2 * Math.PI * d3.time.seconds(d3.time.day.floor(now), now).length / d3.time.seconds(d3.time.day.floor(now), d3.time.day.ceil(now)).length));
            
            
            d3.transition().duration(900).tween("orbit", function () {
              return function (t) {


                    var last_angle = parseFloat(d3.select(".earthOrbitPosition").attr("angle")) || ((newAngle(origin, now, data.planets[params.params.planet].revolution_period, data.planets[params.params.planet].sun_angle)*6.28)/360);
                    var new_angle = last_angle + (1 /(data.planets[params.params.planet].revolution_period/365.2)) /50;

                    d3.select(".earthOrbitPosition").attr("angle", new_angle);

                    var orbitPosition = data.planets[params.params.planet].orbitPosition;
                    var interpolateOrbitPosition = d3.interpolate(orbitPosition.endAngle()(), new_angle);

                    // Animate Planet orbit position
                    d3.select(".earthOrbitPosition").attr("d", orbitPosition.endAngle(interpolateOrbitPosition(t)));

                    // Transition Planet
                    d3.select(".earth")
                      .attr("transform", "translate(" + data.planets[params.params.planet].distance_px * Math.sin(interpolateOrbitPosition(t) - data.planets[params.params.planet].orbitPosition.startAngle()()) + "," + -data.planets[params.params.planet].distance_px * Math.cos(interpolateOrbitPosition(t) - data.planets[params.params.planet].orbitPosition.startAngle()()) + ")");
                  
              };
            });
          }, 1000);
          
        /******************************************/
        //                  Area                  //
        /******************************************/

          var data = [
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
          }


          /******************************************/
        //                  Area                  //
        /******************************************/

          var data = [
            {name: "Locke",    value:  4},
            {name: "Kwon",     value: 2}
          ];


          var weather = {
            svg_element : d3.select('.weather-graph'),
            params : {
              width : ($('.weather').innerWidth()-20),
              height : ($('.weather').innerHeight()-95),
            }
          }

          var w = 300,                        //width
          h = 300,                            //height
          r = 100,                            //radius
          ir = 50,
          pi = Math.PI,
          color = d3.scale.category20c();     
       
          data = [{"label":"one", "value":20}, 
                  {"label":"two", "value":50}, 
                  {"label":"three", "value":30}];
          
          var vis = d3.select("svg") 
              .data([data])          
                  .attr("width", w)  
                  .attr("height", h)
              .append("svg:g")       
                  .attr("transform", "translate(" + r + "," + r + ")")    
       
          var arc = d3.svg.arc()              
              .outerRadius(r)
          .innerRadius(ir);
       
          var pie = d3.layout.pie()           
              .value(function(d) { return d.value; })
              .startAngle(-90 * (pi/180))
              .endAngle(90 * (pi/180));
       
          var arcs = vis.selectAll("g.slice")     
              .data(pie)                          
              .enter()                            
                  .append("svg:g")                
                      .attr("class", "slice");    
       
              arcs.append("svg:path")
                      .attr("fill", function(d, i) { return color(i); } ) 
                      .attr("d", arc);                                    
       
              arcs.append("svg:text")                                     
                      .attr("transform", function(d) {                    

                      return "translate(" + arc.centroid(d) + ")";        
                  })
                  .attr("text-anchor", "middle")                          
                  .text(function(d, i) { return data[i].label; });     

        
      });
    },
    get_planet_infos : function(params){
      return {
        left_earth : Math.round(((params.planets[params.planet_name].distance_earth/params.spaceships.NewHorizons)/24)/30),
        age : Math.round(localStorage.getItem("age")+((Math.round(((params.planets[params.planet_name].distance_earth/params.spaceships.NewHorizons)/24)/30))/12)),
        weight : Math.round(((localStorage.getItem("weight"))/params.planets['earth'].gravity)*params.planets[params.planet_name].gravity),
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