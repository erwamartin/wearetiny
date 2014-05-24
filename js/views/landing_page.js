define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/landing_page.html'
], function($, _, Backbone, LandingPageTemplate){
  var LandingPageView = Backbone.View.extend({
    el: $('#main'),
    render: function(params){
      var compiledTemplate = _.template( LandingPageTemplate, params.translations );
      this.$el.append(compiledTemplate);
    }
  });
  return LandingPageView;
});