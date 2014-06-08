define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/compare_graph.html'
], function($, _, Backbone, d3, CompareGraphTemplate){
  var CompareGraphView = Backbone.View.extend({
    el: $('#main'),
    initialize : function(){
      
    },

    render: function(params){

      var _this = this;

      $.getJSON('data/data.json', function(data){

        var compiledTemplate = _.template( CompareGraphTemplate, params );
        _this.$el.html(compiledTemplate);

        var compare_graph = {
          svg_element : d3.select('.graph .svg'),
          params : {
            width : $('body').innerWidth(),
            height : $('body').outerHeight()-$('.compare_graph header').outerHeight(true)
          },
          graph : { 
            cols : {},
            lines : {},
            margin : {}
          },
          sidebars : {
            right : {},
            bottom : {
              height : 45
            },
            left : {}
          },
          comparators : {
            'size' : {},
            'revolution_period' : {},
            'missions' : {},
            'mass' : {},
            'moons' : {},
            'gravity' : {},
            'day_length' : {},
            'temperature' : {}
          }
        }

        compare_graph.graph.cols.number = _.size(compare_graph.comparators);
        compare_graph.graph.cols.width = compare_graph.params.width/(compare_graph.graph.cols.number+2); // Planets + 2 sidebars

        compare_graph.graph.lines.number = _.size(data.planets);
        compare_graph.graph.lines.width = compare_graph.params.width;
        compare_graph.graph.lines.height = (compare_graph.params.height-compare_graph.sidebars.bottom.height)/(compare_graph.graph.lines.number+1); // Adding margin top and bottom

        compare_graph.graph.margin.top = compare_graph.graph.margin.bottom = compare_graph.graph.lines.height/2;

        // svg
        compare_graph.svg = compare_graph.svg_element.append("svg")
          .attr("width", compare_graph.params.width)
          .attr("height", compare_graph.params.height);

        // graphic
        var y_transform = compare_graph.graph.margin.top;
        compare_graph.graph.g = compare_graph.svg.append("g")
          .attr("transform", "translate(0, "+y_transform+")")
          .attr("class", "compare_graph_graph");

        // Lines
        var planets_counter = 0;
        for(var planet in data.planets){

          var y_transform = planets_counter*compare_graph.graph.lines.height;

          var line = compare_graph.graph.g.append('g')
                .attr("transform", "translate(0, "+y_transform+")")
                .attr("class", "line "+planet);

          line.append("rect")
                .attr("width", compare_graph.graph.lines.width)
                .attr("height", compare_graph.graph.lines.height)
                .attr("fill-opacity", 0);

          var line_params = {
            x1 : 0,
            y1 : compare_graph.graph.lines.height/2,
            x2 : compare_graph.graph.lines.width,
            y2 : compare_graph.graph.lines.height/2
          }

          // Background line
          line.append("line")
                .attr("x1", line_params.x1)
                .attr("y1", line_params.y1)
                .attr("x2", line_params.x2)
                .attr("y2", line_params.y2)
                .attr('stroke', 'rgb(17,58,79)')
                .attr('stroke-width', 1);


          var planet_name = {
            text : params.translations.views.planets[planet].planet_name,
            x : 10,
            y : compare_graph.graph.lines.height/2
          }
          line.append("text")
              .attr("class", "planet_name")
              .text(planet_name.text)
              .attr("transform", "translate("+planet_name.x+", "+planet_name.y+")")
              .attr("style", "dominant-baseline: central;")
              .attr("fill", "rgba(255, 255, 255, 1)");

          planets_counter++;
        }



        /* Comparators */
        // Get comparators values for each planet (and get min and max planet)
        for(var comparator in compare_graph.comparators){
          for(var planet in data.planets){
            compare_graph.comparators[comparator][planet] = data.planets[planet][comparator];
            if(compare_graph.comparators[comparator].min==null 
              || compare_graph.comparators[comparator][compare_graph.comparators[comparator].min]>compare_graph.comparators[comparator][planet]){
              compare_graph.comparators[comparator].min = planet;
            }
            if(compare_graph.comparators[comparator].max==null 
              || compare_graph.comparators[comparator][compare_graph.comparators[comparator].max]<compare_graph.comparators[comparator][planet]){
              compare_graph.comparators[comparator].max = planet;
            }
          }
        }


        var y_transform = planets_counter*compare_graph.graph.lines.height+compare_graph.graph.margin.bottom;
        var comparators_g = compare_graph.graph.g.append('g')
              .attr("transform", "translate(0, "+y_transform+")")
              .attr("class", "comparators");

        // Bottom bar
        comparators_g.append("rect")
              .attr("width", compare_graph.graph.lines.width)
              .attr("height", compare_graph.sidebars.bottom.height)
              .style("fill", "rgba(257, 247, 245, 1)");



        var comparators_counter = 1;  // First column is planets name
        for(var comparator in compare_graph.comparators){

          var comparator_name = comparator;
          var comparator_label = params.translations.views.compare_graph.comparators[comparator_name];
          var x_tranform = comparators_counter*compare_graph.graph.cols.width;

          var comparator_col = compare_graph.graph.g.append('g')
              .attr("transform", "translate("+x_tranform+", 0)")
              .attr("class", "comparator "+comparator_name);

          /* Planets */
          var planets_counter = 0;
          for(var planet in data.planets){

            var y_tranform = planets_counter*compare_graph.graph.lines.height;
            var max_size = compare_graph.graph.lines.height*85/100;

            // planet_size = (((val - val_min)/(val_max-val_min))*(80-5))+5
            var planet_size = (((data.planets[planet][comparator_name]-data.planets[compare_graph.comparators[comparator].min][comparator_name])/(data.planets[compare_graph.comparators[comparator].max][comparator_name]-data.planets[compare_graph.comparators[comparator].min][comparator_name]))*(max_size-5))+5;

            var planet_params = {
              width : planet_size,
              height : planet_size
            }
            planet_params.x = compare_graph.graph.cols.width/2-planet_params.width/2; 
            planet_params.y = compare_graph.graph.lines.height/2-planet_params.height/2+y_tranform; 

            comparator_col.append("image")
              .attr("class", planet)
              .attr("width", planet_params.width)
              .attr("height", planet_params.height)
              .attr("transform", "translate("+planet_params.x+","+planet_params.y+")")
              .attr("xlink:href", "assets/images/planets/"+planet+".svg");

            planets_counter++;
          }




          /* Bottom bar */
          var comparator_g = comparators_g.append('g')
              .attr("transform", "translate("+x_tranform+", 0)")
              .attr("class", "comparator_button");

          // Background
          comparator_g.append("rect")
              .attr("width", compare_graph.graph.cols.width)
              .attr("height", compare_graph.sidebars.bottom.height)
              .attr("class", "comparator_background")
              .attr("fill", "rgba(36, 36, 36, 1)")
              .attr("fill-opacity", 0);

          // Separator
          comparator_g.append("rect")
              .attr("width", 1)
              .attr("height", compare_graph.sidebars.bottom.height)
              .style("fill", "rgba(216, 213, 214, 1)");

          // Comparator name
          var x_tranform = compare_graph.graph.cols.width/2;
          var y_tranform = compare_graph.sidebars.bottom.height/2;
          comparator_g.append("text")
              .attr("class", "comparator_label")
              .text(comparator_label)
              .attr("transform", "translate("+x_tranform+", "+y_tranform+")")
              .attr("style", "text-anchor: middle; dominant-baseline: central;")
              .attr("fill", "rgba(36, 36, 36, 1)");

          // Hover container
          var comparator_container = comparator_g.append("rect")
              .attr("width", compare_graph.graph.cols.width)
              .attr("height", compare_graph.sidebars.bottom.height)
              .attr("class", 'comparator_container')
              .attr("id", comparator_name)
              .attr("fill-opacity", 0);

          comparator_container.on('mouseover', function(){
            var comparator = d3.select(this.parentNode);
            var comparator_background = comparator.select('.comparator_background');
            comparator_background.attr("fill-opacity", 1);
            var comparator_label = comparator.select('.comparator_label');
            comparator_label.attr("fill", "rgba(257, 247, 245, 1)");
            var comparator_name = comparator.attr('id');
          });

          comparator_container.on('mouseout', function(){
            var comparator = d3.select(this.parentNode);
            var comparator_background = comparator.select('.comparator_background');
            comparator_background.attr("fill-opacity", 0);
            var comparator_label = comparator.select('.comparator_label');
            comparator_label.attr("fill", "rgba(36, 36, 36, 1)");
          });

          comparators_counter++;
        }

        // All planets
        var x_tranform = comparators_counter*compare_graph.graph.cols.width;
        var display_all_g = compare_graph.graph.g.append('g')
              .attr("transform", "translate("+x_tranform+", "+y_transform+")")
              .attr("class", "display_all");

        display_all_g.append("rect")
            .attr("width", compare_graph.graph.cols.width)
            .attr("height", compare_graph.sidebars.bottom.height)
            .attr("fill-opacity", 0);

        display_all_g.append("rect")
            .attr("width", 1)
            .attr("height", compare_graph.sidebars.bottom.height)
            .style("fill", "rgba(216, 213, 214, 1)");





      });
    },
    close: function(view){
      //if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return CompareGraphView;
});