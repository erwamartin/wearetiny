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
      console.log("tasoeur");
      var compiledTemplate = _.template( PlanetTemplate, params.translations );
      this.$el.html(compiledTemplate);
    }
  });
  return PlanetView;
});