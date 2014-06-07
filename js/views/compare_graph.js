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
            lines : {}
          },
          sidebars : {
            right : {},
            bottom : {
              height : 45
            },
            left : {}
          },
          comparators : ['size', 'revolution_period', 'missions', 'mass', 'moons', 'gravity', 'day_length', 'temperature']
        }

        compare_graph.graph.cols.number = compare_graph.comparators.length;
        compare_graph.graph.cols.width = compare_graph.params.width/(compare_graph.graph.cols.number+2); // Planets + 2 sidebars

        compare_graph.graph.lines.number = _.size(data.planets);
        compare_graph.graph.lines.width = compare_graph.params.width;
        compare_graph.graph.lines.height = (compare_graph.params.height-compare_graph.sidebars.bottom.height)/compare_graph.graph.lines.number;

        // svg
        compare_graph.svg = compare_graph.svg_element.append("svg")
          .attr("width", compare_graph.params.width)
          .attr("height", compare_graph.params.height);

        // graphic
        compare_graph.graph.g = compare_graph.svg.append("g")
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

          planets_counter++;
        }

        // Comparators
        var y_transform = planets_counter*compare_graph.graph.lines.height;
        var comparators = compare_graph.graph.g.append('g')
              .attr("transform", "translate(0, "+y_transform+")")
              .attr("class", "comparators");

        // Bottom bar
        comparators.append("rect")
              .attr("width", compare_graph.graph.lines.width)
              .attr("height", compare_graph.sidebars.bottom.height)
              .style("fill", "rgba(257, 247, 245, 1)");



        var comparators_counter = 1;  // First column is blank
        for(var comparator in compare_graph.comparators){

          var comparator_name = compare_graph.comparators[comparator];
          var comparator_label = params.translations.views.compare_graph.comparators[comparator_name];
          var x_tranform = comparators_counter*compare_graph.graph.cols.width;

          var comparator_g = compare_graph.graph.g.append('g')
              .attr("transform", "translate("+x_tranform+", "+y_transform+")")
              .attr("class", "comparator "+comparator_name);

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