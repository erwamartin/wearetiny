define([
  'jquery',
  'underscore',
  'backbone',
  'views/landing_page'
], function($, _, Backbone, LandingPageView){
  var AppRouter = Backbone.Router.extend({
    routes: {
      '': 'localeRedirection',
      ':lang/': 'landingPage',
      '*actions': 'default'
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
    localeRedirection : function(){
      var locale = localStorage.getItem('locale') || 'en';
      window.location.href = '/#/'+locale+'/';
    },
    default : function(actions){}
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
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