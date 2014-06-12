define([
  'jquery',
  'underscore',
  'backbone',
  'views/landing_page',
  'views/solar_system',
  'views/distances_graph',
  'views/compare_graph',
  'views/planet',
  'views/error',
  'views/mobile'
], function($, _, Backbone, LandingPageView, SolarSystemView, DistancesGraphView, CompareGraphView, PlanetView, ErrorView, MobileView){
  var AppRouter = Backbone.Router.extend({
    current_view : null,
    routes: {
      '': 'landingPage',
      'solar-system': 'solarSystem',
      'solar-system/distances': 'distanceGraph',
      'solar-system/compare': 'compareGraph',
      'solar-system/:planet': 'planet',
      'mobile': 'mobile',
      '*actions': 'default'
    },
    landingPage : function(){
      loadView.call(this, {
        view : new LandingPageView(), 
        init : true
      });
    },
    solarSystem : function(){
      loadView.call(this, {
        view : new SolarSystemView()
      });
    },
    distanceGraph : function(){
      loadView.call(this, {
        view : new DistancesGraphView()
      });
    },
    compareGraph : function(){
      loadView.call(this, {
        view : new CompareGraphView()
      });
    },

    planet : function(planet){
      loadView.call(this, {
        view : new PlanetView(), 
        params : {
          'planet' : planet
        }
      });
    },
    mobile : function(){
      loadView.call(this, {
        view : new MobileView(), 
        mobile : true
      });
    },
    default : function(actions){
      loadView.call(this, {
        view : new ErrorView()
      });
    }
  });

  var initialize = function(){
    if(!localStorage.getItem('locale')) localStorage.setItem('locale', 'en');
    var app_router = new AppRouter;
    Backbone.history.start();
    return app_router;
  };

  var loadView = function(params_in){
    var params = {params : {
      init : false,
      mobile : false
    }};
    $.extend(true, params, params_in);

    if($('body').innerWidth()<1200 && !params.mobile){
      window.location.href = '#mobile';
    }else if(params.mobile && $('body').innerWidth()>=1200){
      window.location.href = '#solar-system';
    }

    if(params.init){
      $('#loader').show(0, function (){
        renderView.call(this, params);        
      });
    }else{
      $('#loader').fadeIn(300, function (){
        renderView.call(this, params);
      });
    }
  }

  var renderView = function(params){
    getTranslations.call(this, {
      callback : function(translations){
        // Callback of last view
        if(AppRouter.current_view && AppRouter.current_view.close)
           AppRouter.current_view.close.call(this, AppRouter.current_view); 

        AppRouter.current_view = params.view;
        AppRouter.current_view.render({
          translations : translations,
          functions : {
            formatNumber : formatNumber, 
            animateTextNumber : animateTextNumber,
            getNextKey : getNextKey,
            getPreviousKey : getPreviousKey
          },
          params : params.params
        });
      }
    });
  }

  var getTranslations = function(params){
    var locale = localStorage.getItem('locale');
    $.getJSON('data/' + locale + '.json', function(translations){
      params.callback.call(this, translations);
    });
  };

  var formatNumber = function(number, separator){
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  var getNextKey = function(array, key){
      var keys = Object.keys(array),
          idIndex = keys.indexOf(key),
          nextIndex = idIndex += 1;
      if(nextIndex >= keys.length){
          //we're at the end, there is no next
          return keys[0];
      }
      var nextKey = keys[nextIndex];
      return nextKey;
  }

  var getPreviousKey = function(array, key){

    var keys = Object.keys(array),
        idIndex = keys.indexOf(key),
        nextIndex = idIndex -= 1;
    if(idIndex === -1){
        //we're at the beginning, there is no previous -> return last
        return keys[keys.length-1];
    }
    var nextKey = keys[nextIndex];
    return nextKey;
  }

  var animateTextNumber = function(params) {
    console.log(params);
    if(!params.delay) params.delay = 3000;
    if(!params.duration) params.duration = 4000;
    jQuery({dataValue: 0}).animate({dataValue: params.value}, {
      duration: params.duration,
      delay : params.delay,
      easing:'swing', 
      step: function() { 
        $(params.selector).text(formatNumber.call(this, (Math.round(this.dataValue*100))/100, params.separator));
      },
      complete : function(){
        $(params.selector).text(formatNumber.call(this, params.value, params.separator));
      }
    });
  };


  return {
    initialize: initialize
  };
});