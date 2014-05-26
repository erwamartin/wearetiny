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
      var compiledTemplate = _.template( SolarSystemTemplate, params );
      this.$el.html(compiledTemplate);
    }
  });
  return SolarSystemView;
});