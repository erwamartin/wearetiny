define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/distances_graph.html'
], function($, _, Backbone, d3, DistancesGraphTemplate){
  var DistancesGraphView = Backbone.View.extend({
    el: $('#main'),
    initialize : function(){
      
    },

    render: function(params){

      var _this = this;

      $.getJSON('data/data.json', function(data){


        params.distances_graph = {
          planet : _this.get_planet_infos({
            translations : params.translations,
            functions : params.functions,
            planets : data.planets,
            planet_name : 'earth'
          })
        }

        var compiledTemplate = _.template( DistancesGraphTemplate, params );
        _this.$el.html(compiledTemplate);


        /******************************************/
        //             Distances Graph            //
        /******************************************/

        var distances_graph = {
          svg_element : d3.select('.distances_comparison .svg'),
          params : {
            width : $('body').innerWidth()*80/100,
            height : 275,
            margin : {
              top : 10
            }
          },
          points : {
            number : 60,
            radius : 3
          },
          graph : {},
          scale : {
            x : {
              height : 25
            },
            y : {
              width : 70,
              font_size : 15
            }
          }
        }

        distances_graph.graph.height = distances_graph.params.height - distances_graph.scale.x.height;
        distances_graph.sun = {
          radius : distances_graph.graph.height/2*90/100
        }
        // SVG width - solar width - 1/2 point width - scale y width
        distances_graph.graph.width = distances_graph.params.width - (distances_graph.sun.radius - (distances_graph.sun.radius/5)) - distances_graph.points.radius - distances_graph.scale.y.width;

        // svg
        distances_graph.svg = distances_graph.svg_element.append("svg")
          .attr("width", distances_graph.params.width)
          .attr("height", distances_graph.params.height);


        // graphic
        distances_graph.graphic = distances_graph.svg.append("g")
          .attr("class", "distances_graph_graphic");

        // Sun
        distances_graph.graphic.append("image")
          .attr("class", "sun")
          .attr("width", distances_graph.sun.radius*2)
          .attr("height", distances_graph.sun.radius*2)
          .attr("x",  - ((distances_graph.sun.radius)+(distances_graph.sun.radius/5)))
          .attr("y",  (distances_graph.graph.height-distances_graph.params.margin.top-distances_graph.sun.radius*2)/2)
          .attr("xlink:href", "assets/images/planets/sun.svg");
       
        distances_graph.points.distance_w = distances_graph.graph.width/distances_graph.points.number;
        distances_graph.points.distance_h = distances_graph.graph.height/_.size(data.planets);
        distances_graph.sun.width = (distances_graph.sun.radius*2-((distances_graph.sun.radius)+(distances_graph.sun.radius/5))) + (distances_graph.points.distance_w); // Sun + right margin

        // Planets

        var ua = data.planets['earth'].distance_solar;
        var line_width = distances_graph.params.width-distances_graph.sun.width;
        var line_height = distances_graph.points.distance_h;
        var line_x = distances_graph.sun.width - distances_graph.points.radius*2;

        var count_planets = 0;
        for(var planet in data.planets){

          var y_transform = distances_graph.points.distance_h*count_planets+distances_graph.points.radius+distances_graph.params.margin.top;
          var line = distances_graph.graphic.append("g")
              .attr("id", planet)
              .attr("class", "line");

          var in_way = true; // The planet is further

          var line_y = y_transform - line_height/2;
          line.append("rect")
            .attr("width", line_width)
            .attr("height",  line_height)
            .attr("class", "line_container")
            .attr("fill-opacity", 0)
            .attr("transform", "translate(" +line_x+ ", "+line_y+")");

          for(var cpt=0; cpt<distances_graph.points.number; cpt++){
            var x_transform = distances_graph.sun.width+(distances_graph.points.distance_w*cpt)-distances_graph.points.radius;
            var fill_color = "rgba(255, 255, 255, 0.15)";
            // 1 UA == data.planets['earth'].distance_solar
            // 0.75 => 0.5 + round of 0.25
            var classs = "";
            if(data.planets[planet].distance_solar/ua>cpt/2+0.75){
              classs = " selected";
              fill_color = "#FFF";
            }else if(in_way){
              classs = " planet";
              fill_color = data.planets[planet].color1;
              in_way = false;
            }

            line.append("circle")
              .attr("class", "point"+classs)
              .attr("r", distances_graph.points.radius)
              .attr("fill", fill_color)
              .attr("transform", "translate(" +x_transform+ ", "+y_transform+")");
          }

          line.append("text")
            .attr("class", "planet_name")
            .text(planet[0])
            .attr("transform", "translate("+(x_transform+20)+", "+(y_transform+distances_graph.scale.y.font_size/3)+")")
            .attr("font-size", distances_graph.scale.y.font_size+"px")
            .attr("fill", "white");

          line.append("image")
            .attr("class", planet)
            .attr("width", distances_graph.points.distance_h*70/100)
            .attr("height", distances_graph.points.distance_h*70/100)
            .attr("transform", "translate("+(x_transform+50)+", "+(y_transform-(distances_graph.points.distance_h/2)+(distances_graph.points.distance_h*30/100)/2)+")")
            .attr("xlink:href", "assets/images/planets/"+planet+".svg");

          line.on('mouseover', function(){
            var planet_name = d3.select(this).attr('id');
            var planet_infos = _this.get_planet_infos({
              translations : params.translations,
              functions : params.functions,
              planets : data.planets,
              planet_name : planet_name
            });

            d3.select(this).selectAll('.selected')
              .transition()
              .duration(300)
              .attr("r", distances_graph.points.radius*2);
            d3.select(this).selectAll('.planet')
              .transition()
              .duration(300)
              .attr("r", distances_graph.points.radius*2);

            $(".planet_infos .km_distance").fadeOut(100, function() {
              $(".planet_infos .km_distance").fadeIn(100);
              params.functions.animateTextNumber.call(this, {separator : params.translations.views.global.number_separator, selector : ".planet_infos .km_distance", value : planet_infos.solar_distance.km, duration : 650});
            });
            $('.planet_infos .planet_name').text(planet_infos.name);
            $('.planet_infos .ua_distance .value').text(planet_infos.solar_distance.ua);
          });

          line.on('mouseout', function(){
            d3.select(this).selectAll('.selected')
              .transition()
              .duration(300)
              .attr("r", distances_graph.points.radius);
            d3.select(this).selectAll('.planet')
              .transition()
              .duration(300)
              .attr("r", distances_graph.points.radius);
          });

          count_planets++;

        }

         // scale x
        distances_graph.scale.x.g = distances_graph.svg.append("g")
          .attr("transform", "translate(0, "+(distances_graph.graph.height)+")")
          .attr("class", "distances_graph_scale");

        distances_graph.scale.x.g.append("rect")
          .attr("width", distances_graph.params.width)
          .attr("height",  distances_graph.scale.x.height)
          .style("fill", "rgba(6, 19, 25, 1.0)");


        for(var cpt=1; cpt<=distances_graph.points.number/2; cpt++){

            var text_width = 18;
            if(cpt<10)  text_width = text_width/2;
            var text_height = 10;

            var x_transform = distances_graph.sun.width+(distances_graph.points.distance_w*((cpt*2)-1))-text_width/1.65;
            var y_transform = distances_graph.scale.x.height/2+text_height/2;

            distances_graph.scale.x.g.append("text")
              .attr("class", "planet_name")
              .text(cpt)
              .attr("transform", "translate(" +x_transform+ ", "+y_transform+")")
              .attr("font-size", distances_graph.scale.y.font_size+"px")
              .attr("fill", "white");
          }

          // Hide loader
          setTimeout(function() {
            $('#loader').fadeOut()
          }, 500);
        

      });
    },
    get_planet_infos : function(params){
      return {
        name : params.translations.views.planets[params.planet_name].planet_name,
        solar_distance : {
          ua : Math.round(params.planets[params.planet_name].distance_solar/params.planets['earth'].distance_solar*100)/100,
          km : params.planets[params.planet_name].distance_solar
        }
      };
    },
    close: function(view){
      if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return DistancesGraphView;
});