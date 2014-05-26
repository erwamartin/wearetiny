define([
  'jquery',
  'underscore',
  'backbone',
  'views/landing_page',
  'views/solar_system',
  'views/planet'
], function($, _, Backbone, LandingPageView, SolarSystemView, PlanetView){
  var AppRouter = Backbone.Router.extend({
    routes: {
      '': 'localeRedirection',
      ':lang/': 'landingPage',
      ':lang/solar-system/': 'solarSystem',
      ':lang/solar-system/:planet/': 'planet',
      '*actions': 'default'
    },

    goTo : function(params_in){
      var params = {path : '', callback : function(){}};
      $.extend(true, params, params_in);
      var locale = localStorage.getItem('locale');
      this.navigate('#/'+locale+'/'+params.path, {trigger: true});
      params.callback.call(this);
    },

    landingPage : function(lang){
      getTranslations.call(this, {
        callback : function(translations){
          var landingPageView = new LandingPageView();
          landingPageView.render({
            translations : translations
          });
        },
        locale : lang
      });
    },
    solarSystem : function(lang){
      getTranslations.call(this, {
        callback : function(translations){
          var solarSystemView = new SolarSystemView();
          solarSystemView.render({
            translations : translations
          });
        },
        locale : lang
      });
    },
    planet : function(lang, planet){
      console.log(planet);
      getTranslations.call(this, {
        callback : function(translations){
          
          var planetView = new PlanetView();
          planetView.render({
            translations : translations,
            planet : planet
          });
        },
        locale : lang
      });
    },
    localeRedirection : function(){
      var locale = localStorage.getItem('locale') || 'en';
      window.location.href = '/#/'+locale+'/';
    },
    default : function(actions){}
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
    return app_router;
  };

  var getTranslations = function(params){
    localStorage.setItem('locale', params.locale);
    $.getJSON('data/' + params.locale + '.json', function(translations){
      params.callback.call(this, translations);
    });
  }

  return {
    initialize: initialize
  };
});