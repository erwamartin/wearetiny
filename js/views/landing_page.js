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

      var video = $('.landing_page video').get(0);
      var page_showed = false;

      video.addEventListener('timeupdate', function() {
        if(this.currentTime >= 5 && !page_showed) {
          $('.landing_page #lang, .landing_page footer, .landing_page .about, .landing_page .csswinner').fadeIn(1500);
          page_showed=true;
        }
      }, false);

      video.addEventListener('loadeddata', function() {
        $('#loader').fadeOut(300, function(){
          video.play();
        });
      });

      video.load();
    },
    loadSolarSystem : function(evt){
      window.location.href = '#solar-system';
      evt.preventDefault();
    }
  });
  return LandingPageView;
});