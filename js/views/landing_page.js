define([
  'jquery',
  'underscore',
  'backbone',
  'libs/jquery.zoomooz',
  'text!templates/landing_page.html'
], function($, _, Backbone, Zoomooz,LandingPageTemplate){
  var LandingPageView = Backbone.View.extend({
    el: $('#main'),
    events : {
      'click .solar_system' : 'loadSolarSystem'
    },
    render: function(params){
      var compiledTemplate = _.template( LandingPageTemplate, params );
      this.$el.html(compiledTemplate);
    },
    loadSolarSystem : function(evt){
      window.location.href = '#solar-system';
      evt.preventDefault();
    }
  });
  return LandingPageView;
});