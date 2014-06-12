define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/error.html'
], function($, _, Backbone, d3, ErrorTemplate){
  var ErrorView = Backbone.View.extend({
    el: $('#main'),
    events : {
      'click .solar_system_button_error' : 'loadSolarSystem'
    },
    initialize : function(){
      
    },

    render: function(params){

      var _this = this;

        var compiledTemplate = _.template( ErrorTemplate, params );
        _this.$el.html(compiledTemplate);

      // Hide loader
      setTimeout(function() {
        $('#loader').fadeOut()
      }, 300);
    },
    loadSolarSystem : function(evt){
      document.getElementById('spacecraft').className ='spacecraft';

      setTimeout(function () {
        window.location.href = '#solar-system';
       
      }, 2000); //will call the function after 2 secs.
       evt.preventDefault();
    }
  });
  return ErrorView;
});