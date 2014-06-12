define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/mobile.html'
], function($, _, Backbone, d3, MobileTemplate){
  var MobileView = Backbone.View.extend({
    el: $('#main'),
    initialize : function(){
      
    },
    render: function(params){

      var _this = this;

      var compiledTemplate = _.template( MobileTemplate, params );
      _this.$el.html(compiledTemplate);

      // Hide loader
      setTimeout(function() {
        $('#loader').fadeOut()
      }, 300);
    }
  });
  return MobileView;
});