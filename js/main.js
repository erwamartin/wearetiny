require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'd3': {
        exports: 'd3'
    }
  },
  paths: {
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    d3: 'libs/d3',
    templates: '../templates'
  }

});

require([
  'app'
], function(App){
  App.initialize();
});