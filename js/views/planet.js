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

      if(!localStorage.getItem('age') || !localStorage.getItem('weight') || !localStorage.getItem('transportation')){
        window.location.href = '#solar-system';
      }

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

        var compiledTemplate = _.template( PlanetTemplate, params );
         _this.$el.html(compiledTemplate);

        /*******************************************/
        //                Calendar                 //
        /******************************************/

        var now = new Date(d3.time.year.floor(new Date()));

         var space_time = {
                    svg_element : d3.select('.calendar-graph'),
                    params : {
                      width : ($('.calendar').innerWidth()-10),
                      height : 185,
                    }
                  }
        space_time.params.radius = Math.min(space_time.params.width, space_time.params.height)/2;

        var radii = {
          "sun": space_time.params.radius / 2.5,
          "earthOrbit": space_time.params.radius / 1.2,
          "earth": space_time.params.radius / 6.15,
        };

        // Space
        space_time.svg = space_time.svg_element.append("svg")
          .attr("width", space_time.params.width )
          .attr("height", space_time.params.height)
          .append("g")
            .attr("transform", "translate(" + space_time.params.width  / 2 + "," + space_time.params.height / 2 + ")");

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
        space_time.svg.append("path")
          .attr("class", "earthOrbitPosition")
          .attr("d", earthOrbitPosition)
          .style("fill", "rgba(255, 204, 0, 0.75)");

        // Earth
        space_time.svg.append("circle")
          .attr("class", "planet_s")
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


          var origin = new Date(2014, 0, 1, 1, 0, 0, 0);
          var now = new Date();
        // Update the clock every second
         _this.animation_timer = setInterval(function () {
          now = new Date();
          
          //var interpolateEarthOrbitPosition = d3.interpolate(earthOrbitPosition.endAngle()(), (2 * Math.PI * d3.time.hours(d3.time.year.floor(now), now).length / d3.time.hours(d3.time.year.floor(now), d3.time.year.ceil(now)).length));
          //var interpolateDay = d3.interpolate(day.endAngle()(), (2 * Math.PI * d3.time.seconds(d3.time.day.floor(now), now).length / d3.time.seconds(d3.time.day.floor(now), d3.time.day.ceil(now)).length));
          
         
          d3.transition().duration(2000).tween("orbit", function () {
            return function (t) {

              var last_angle = ((newAngle(origin, now, data.planets[params.params.planet].revolution_period, data.planets[params.params.planet].sun_angle)*6.28)/360);
              var new_angle = last_angle;
               var orbitPosition = earthOrbitPosition;
              var interpolateEarthOrbitPosition = d3.interpolate(orbitPosition.endAngle()(), new_angle);


              var last_angle_day = ((newAngle(origin, now, data.planets[params.params.planet].rotation, 0)*6.28)/360);
              var new_angle_day = last_angle_day;
              var interpolateDay = d3.interpolate(day.endAngle()(), new_angle_day);


              // Animate Earth orbit position
              d3.select(".earthOrbitPosition").attr("d", earthOrbitPosition.endAngle(interpolateEarthOrbitPosition(t)));

              // Transition Earth
              d3.select(".planet_s")
                .attr("transform", "translate(" + radii.earthOrbit * Math.sin(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + "," + -radii.earthOrbit * Math.cos(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + ")");

              // Animate day
              // Transition day
              d3.select(".day")
                .attr("d", day.endAngle(interpolateDay(t)))
                .attr("transform", "translate(" + radii.earthOrbit * Math.sin(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + "," + -radii.earthOrbit * Math.cos(interpolateEarthOrbitPosition(t) - earthOrbitPosition.startAngle()()) + ")");
                  };
          });
        }, 1000);
          
        /*******************************************/
        //                   Area                  //
        /******************************************/

          var area_data = [
            {
              name: "planet",    
              value:  data.planets[params.params.planet].size,
              color:  data.planets[params.params.planet].color1,
            },
            {
              name: "earth",     
              value: data.planets["earth"].size,
              color:  data.planets["earth"].color1,
            }
          ];

          
              var area = {
                svg_element : d3.select('.area-graph'),
                params : {
                  width : ($('.area').innerWidth()-20),
                  height : 172,
                }
              }
 
              var y = d3.scale.linear()
                  .range([area.params.height, 0]) 
                  .domain([0, d3.max(area_data, function(d) { return d.value; })]);

             area.svg = area.svg_element.append("svg")
                  .attr("width", area.params.width)
                  .attr("height", area.params.height);

              var barWidth = 112;

              var bar = area.svg.selectAll("g")
                  .data(area_data)
                  .enter().append("g")
                  .attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

            _this.animation2_timer = setInterval(function () {
              bar.append("rect")
                  .attr("x", 45)
                  .attr("y", function(d) { return y(d.value); })
                  .attr("height", 0)
                  .attr("width", barWidth - 4)
                  .style("fill",  function(d) { return d.color; })
                  .transition()
                    .duration(1000)
                    .ease("linear")
                    .attr("height", function(d) { return area.params.height - y(d.value); });

                  d3.max(area_data, function(d) { return area.params.height - y(d.value); })


              bar.append("rect")
                  .attr("y",  d3.max(area_data, function(d) { return area.params.height - y(d.value); })-2)
                  .attr("height", 2 )
                  .attr("width", 290)
                  .style("fill", "rgba(255, 255, 255,  1)")
                  .style("stroke", "rgba(255, 255, 255,  1)");

              function type(d) {
                d.value = +d.value; // coerce to number
                return d;
              }
          }, 1250);


        /********************************************/
        //                 Weather                 //
        /******************************************/

          var gauge = function(container, configuration) {
           var that = {};
           this.config = {
            size      : 212,
            clipWidth     : ($('.weather').innerWidth()-10),
            clipHeight     : 212,
            ringInset     : 20,
            ringWidth     : 20,
            
            minValue     : -500,
            maxValue     : 500,
            
            minAngle     : -90,
            maxAngle     : 90,
            
            transitionMs    : 1000,
            
            majorTicks     : 0,
            labelFormat     : d3.format(',g'),
            labelInset     : 10,
           };
           
           
           var range = undefined;
           var r = undefined;

           var value = 0;
           
           var svg = undefined;
           var arc = undefined;
           var scale = undefined;
           var ticks = undefined;
           var tickData = undefined;
           
           var value = {previous:0, value:0};

           var donut = d3.layout.pie();
           
           this.deg2rad = function (deg) {
            return deg * Math.PI / 180;
           }
           
           this.newAngle =  function(d) {
            var ratio = scale(d);
            var newAngle = this.config.minAngle + (ratio * range);
            return newAngle;
           }
           
           this.configure = function(configuration) {
            var that = this;
            var prop = undefined;
            for ( prop in configuration ) {
             this.config[prop] = configuration[prop];
            }
            
            range = this.config.maxAngle - this.config.minAngle;
            r = this.config.size / 2;

            // a linear scale that maps domain values to a percent from 0..1
            scale = d3.scale.linear()
             .range([0,1])
             .domain([this.config.minValue, this.config.maxValue]);
             
            ticks = scale.ticks(this.config.majorTicks);
            tickData=[1];

            this.arc = d3.svg.arc()
             .innerRadius(r - this.config.ringWidth - this.config.ringInset)
             .outerRadius(r - this.config.ringInset)
             .startAngle(function(d, i) {
              var ratio = d * i;
              var value =that.deg2rad(that.config.minAngle + (ratio * range));
              return value;
             })
             .endAngle(function(d, i) {
              var ratio = d * (i+1);
              var value =that.deg2rad(that.config.minAngle + (ratio * range));
              return that.deg2rad(that.config.minAngle + (ratio * range));
             });
             
            this.arcPointer = d3.svg.arc()
             .innerRadius(r - this.config.ringWidth - this.config.ringInset)
             .outerRadius(r - this.config.ringInset)
             .startAngle(function(d, i) {
              return that.deg2rad(-90);
             })
             .endAngle(function(d, i) {
              var ratio = scale(d);
              return that.deg2rad(that.config.minAngle + (ratio * range));
             });

            this.arcZero = d3.svg.arc()
             .innerRadius(r - this.config.ringWidth - this.config.ringInset)
             .outerRadius(r - this.config.ringInset)
             .startAngle(88)
             .endAngle(92)

           }
           
           this.isRendered = function() {
            return (svg !== undefined);
           }

           
           this.render = function(newValue) {
            var that = this;
            svg = d3.select(container)
             .append('svg:svg')
                .attr("y",  d3.max(area_data, function(d) { return area.params.height - y(d.value); })-3)
              .attr('class', 'gauge')
              .attr('width', this.config.clipWidth)
              .attr('height', this.config.clipHeight);
            
            this.arcs = svg.append('g')
              .attr('class', 'arc')
             
              .attr('transform', 'translate('+145 +','+ (d3.max(area_data, function(d) { return area.params.height - y(d.value); })-2)+')');
            
            this.arcs.selectAll('path')
              .data([1])

             .enter().append('path')
              .attr('fill', '#FFF')
              .attr('d', this.arc);
            
            var lg = svg.append('g')
              .attr('class', 'label')
              .attr('transform', 'translate('+145 +','+ (d3.max(area_data, function(d) { return area.params.height - y(d.value); })-2)+')');


            this.arcs2 = svg.append('g')
             .attr('class', 'arc')
             .attr('transform', 'translate('+145 +','+ (d3.max(area_data, function(d) { return area.params.height - y(d.value); })-2)+')');


            this.bar = svg.append("rect")
              .attr("y",  d3.max(area_data, function(d) { return area.params.height - y(d.value); })-3)
              .attr("height", 2 )
              .attr("width", 290)
              .style("fill", "rgba(255, 255, 255,  1)")
              .style("stroke", "rgba(255, 255, 255,  1)");
            
            var textValue = svg.append('g')
              .attr('class', 'arc')
              .attr('transform', 'translate('+140 +','+195 +')');

            var titleValue = svg.append('g')
              .attr('transform', 'translate('+200+','+195+')');

            var minValue = svg.append('g')
              .attr('transform', 'translate('+55+','+ 195+')');

            var maxValue = svg.append('g')
              .attr('transform', 'translate('+200+','+ 195+')');
              
            this.valueTextCenter = textValue.append('text').attr('class','valueText').text('0');
            this.minTextCenter = minValue.append('text').attr('class','minText').text(this.config.minValue);
            this.maxTextCenter = maxValue.append('text').attr('class','maxText').text(this.config.maxValue);

            this.update(newValue === undefined ? 0 : newValue);

            // Hide loader
            setTimeout(function() {
              $('#loader').fadeOut()
            }, 1000);
           }

           
           this.update = function(newValue, newConfiguration) {
            var that = this;
            if ( newConfiguration  !== undefined) {
             this.configure(newConfiguration);
            }
            value.previous = value.value;
            value.value = newValue;
            var ratio = scale(newValue);
            var newAngle = this.config.minAngle + (ratio * range);
            
            indicator = this.arcs2.selectAll('path').data([value.value]);
            indicator.enter().append("svg:path").transition().ease('linear')
            .duration(this.config.transitionMs)
            .attrTween('d', function(a){
             
               var i = d3.interpolate(value.previous, a);
               this._current = i(0);
               return function(t) {
              return that.arcPointer(i(t));
               };

            });

            indicator.transition()
               .ease("linear")
               .duration(this.config.transitionMs)
               .attrTween("d", function(a){
             
               var i = d3.interpolate(value.previous, a);
               //this._current = i(0);
               return function(t) {
              return that.arcPointer(i(t));
               };

            }).attr('fill',function(d){
                if(d<0){
                  return 'rgba(66,183,227,1)';
                }else if(d>0){
                  return 'rgba(243,68,58,1)';
                }
            });
           }

           this.configure(configuration);
           
          };
          var powerGauge = new gauge('.weather-graph');
          powerGauge.render(); 
          _this.animation3_timer = setInterval(function () {
              powerGauge.update(data.planets[params.params.planet].temperature);
          }, 1000);
      });


    },
    get_planet_infos : function(params){
      var age = parseFloat(localStorage.getItem("age"));
      var weight = parseFloat(localStorage.getItem("weight"));
      var transportation = localStorage.getItem("transportation");
      var planet_infos = {};
      planet_infos.left_earth = Math.round(parseFloat((((params.planets[params.planet_name].distance_earth/params.spaceships[transportation].speed)/24)/30)));
      planet_infos.age = Math.round(age+planet_infos.left_earth/12);
      planet_infos.weight = Math.round((weight/params.planets['earth'].gravity)*params.planets[params.planet_name].gravity);
      planet_infos.temperature = params.planets[params.planet_name].temperature;
      planet_infos.revolution_period = Math.round(parseFloat(params.planets[params.planet_name].revolution_period));
      planet_infos.rotation = Math.round(parseFloat(params.planets[params.planet_name].rotation*24));
      planet_infos.earthTall = Math.round((params.planets[params.planet_name].size/params.planets['earth'].size)*100)/100;

      params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".left_earthNumber", value : planet_infos.left_earth});
      params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".ageNumber", value : planet_infos.age});
      params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".weightNumber", value : planet_infos.weight});
      params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".rotationNumber", value : Math.round(planet_infos.rotation)});
      params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".revolution_periodNumber", value : Math.round(planet_infos.revolution_period)});
      params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".temperatureNumber", value : planet_infos.temperature});
      params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".earthTallNumber", value : planet_infos.earthTall});

      return planet_infos;
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return PlanetView;
});