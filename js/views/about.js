define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/about.html'
], function($, _, Backbone, d3, AboutTemplate){
  var AboutView = Backbone.View.extend({
    el: $('#main'),
    initialize : function(){
      
    },
    render: function(params){

      var _this = this;

      var compiledTemplate = _.template( AboutTemplate, params );
      _this.$el.html(compiledTemplate);

      // Hide loader
      setTimeout(function() {
        $('#loader').fadeOut()
      }, 300);
    }
  });
  return AboutView;
});