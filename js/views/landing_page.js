define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/landing_page.html'
], function($, _, Backbone, LandingPageTemplate){
  var LandingPageView = Backbone.View.extend({
    el: $('#main'),
    events : {
      'click .solar_system_button' : 'loadSolarSystem'
    },
    render: function(params){
      var compiledTemplate = _.template( LandingPageTemplate, params );
      this.$el.html(compiledTemplate);

      // Lang selection
      $('#lang-choice a').on('click', function(){
        localStorage.setItem('locale', $(this).data('lang'));
      });

      // Hide loader
      setTimeout(function(){
        $('#loader').fadeOut();
      }, 300);
    },
    loadSolarSystem : function(evt){
      window.location.href = '#solar-system';
      evt.preventDefault();
    }
  });
  return LandingPageView;
});