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
          comparators : ['size', 'revolution_period', 'missions', 'moons', 'gravity', 'day_length', 'temperature']
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
                .attr("height", compare_graph.graph.lines.height);

          planets_counter++;
        }




      });
    },
    close: function(view){
      //if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return CompareGraphView;
});