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
      var compiledTemplate = _.template( LandingPageTemplate, params.translations );
      this.$el.html(compiledTemplate);
    },
    loadSolarSystem : function(evt){
      //alert('test');
      app.router.goTo({'path' : 'solar-system/'});
      //window.location.href = '/#/solar-system/';
      //$('.landing_page .solar_system span').zoomTo({targetsize:0.75, duration:1200});
      evt.preventDefault();
    }
  });
  return LandingPageView;
});