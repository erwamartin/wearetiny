define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/solar_system.html'
], function($, _, Backbone, SolarSystemTemplate){
  var SolarSystemView = Backbone.View.extend({
    el: $('#main'),
    render: function(params){
      var compiledTemplate = _.template( SolarSystemTemplate, params.translations );
      this.$el.append(compiledTemplate);
    }
  });
  return SolarSystemView;
});