require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  },
  paths: {
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    templates: '../templates'
  }

});

require([
  'app'
], function(App){
  App.initialize();
});