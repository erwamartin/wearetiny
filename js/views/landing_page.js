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


        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/fr_FR/sdk.js#xfbml=1&appId=310613592396790&version=v2.0";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));

      // Hide loader
      setTimeout(function() {
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