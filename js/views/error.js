define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/error.html'
], function($, _, Backbone, d3, ErrorTemplate){
  var ErrorView = Backbone.View.extend({
    el: $('#main'),
    initialize : function(){
      
    },

    render: function(params){

      var _this = this;

        var compiledTemplate = _.template( ErrorTemplate, params );
        _this.$el.html(compiledTemplate);

            // Hide loader
            setTimeout(function() {
              $('#loader').fadeOut()
            }, 1000);

    }
  });
  return ErrorView;
});