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
      var compiledTemplate = _.template( SolarSystemTemplate, params.translations );
      this.$el.html(compiledTemplate);

      var system = d3.select(this.el);

      var width = 960,
          height = 500,
          radius = Math.min(width, height);
      var svg = system.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    }
  });
  return SolarSystemView;
});