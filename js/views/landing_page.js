define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/landing_page.html'
], function($, _, Backbone, LandingPageTemplate){
  var LandingPageView = Backbone.View.extend({
    el: $('#main'),
    events : {
      'click .solar_system' : 'loadSolarSystem'
    },
    render: function(params){
      var compiledTemplate = _.template( LandingPageTemplate, params.translations );
      this.$el.append(compiledTemplate);
    },
    loadSolarSystem : function(){
      //alert('test');
      app.router.goTo({'path' : 'solar-system/'});
      //window.location.href = '/#/solar-system/';
    }
  });
  return LandingPageView;
});