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

      //D3JS

      $.getJSON('data/data.json', function(data){
        //console.log(data);
        console.log(d3.select('.calendar-graph'));
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
          "sun": space_time.params.radius / 6,
          "earthOrbit": space_time.params.radius / 1.875,
          "earth": space_time.params.radius / 16.5,
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

          var interpolateEarthOrbitPosition = d3.interpolate(earthOrbitPosition.endAngle()(), (2 * Math.PI * d3.time.hours(d3.time.year.floor(now), now).length / d3.time.hours(d3.time.year.floor(now), d3.time.year.ceil(now)).length));
          
          var interpolateDay = d3.interpolate(day.endAngle()(), (2 * Math.PI * d3.time.seconds(d3.time.day.floor(now), now).length / d3.time.seconds(d3.time.day.floor(now), d3.time.day.ceil(now)).length));
          
          
          d3.transition().duration(900).tween("orbit", function () {
            return function (t) {
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
              
            };
          });
        }, 1000);
        
        // AREA //

        var data = [
          {name: "Locke",    value:  4},
          {name: "Kwon",     value: 2}
        ];


        var area = {
          svg_element : d3.select('.area-graph'),
          params : {
            width : ($('.area').innerWidth()-20),
            height : ($('.area').innerHeight()-100),
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

            console.log( );

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

        
      });
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return PlanetView;
});