var app = {};

define([
  'jquery',
  'underscore',
  'backbone',
  'router',
], function($, _, Backbone, Router){
  var initialize = function(){
    app.router = Router.initialize();
  }

  return {
    initialize: initialize
  };
});