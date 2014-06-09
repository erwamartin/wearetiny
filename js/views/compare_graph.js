define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/compare_graph.html'
], function($, _, Backbone, d3, CompareGraphTemplate){
  var CompareGraphView = Backbone.View.extend({
    el: $('#main'),
    initialize : function(){
      
    },

    render: function(params){

      var _this = this;

      $.getJSON('data/data.json', function(data){

        var compiledTemplate = _.template( CompareGraphTemplate, params );
        _this.$el.html(compiledTemplate);

        if(!localStorage.getItem('planet_compare'))
          localStorage.setItem('planet_compare', 'earth');

        var compare_graph = {
          svg_element : d3.select('.graph .svg'),
          params : {
            width : $('body').innerWidth(),
            height : $('body').outerHeight()-$('.compare_graph header').outerHeight(true)
          },
          graph : { 
            cols : {},
            lines : {},
            margin : {}
          },
          banner : {},
          planets : {},
          sidebars : {
            right : {},
            bottom : {
              height : 45
            },
            left : {}
          },
          comparators : {
            'moons' : {},
            'revolution_period' : {},
            'size' : {},
            'day_length' : {},
            'mass' : {},
            'gravity' : {},
            'temperature' : {},
            'missions' : {}
          }
        }

        compare_graph.graph.cols.number = _.size(compare_graph.comparators);
        compare_graph.graph.cols.width = compare_graph.params.width/(compare_graph.graph.cols.number+2); // Planets + 2 sidebars

        compare_graph.graph.lines.number = _.size(data.planets);
        compare_graph.graph.lines.width = compare_graph.params.width;
        compare_graph.graph.lines.height = (compare_graph.params.height-compare_graph.sidebars.bottom.height)/(compare_graph.graph.lines.number+1); // Adding margin top and bottom

        compare_graph.graph.margin.top = compare_graph.graph.margin.bottom = compare_graph.graph.lines.height/2;
        
        compare_graph.planets.max_size = compare_graph.graph.lines.height*85/100;

        // svg
        compare_graph.svg = compare_graph.svg_element.append("svg")
          .attr("width", compare_graph.params.width)
          .attr("height", compare_graph.params.height);

        // graphic
        var y_transform = compare_graph.graph.margin.top;
        compare_graph.graph.g = compare_graph.svg.append("g")
          .attr("transform", "translate(0, "+y_transform+")")
          .attr("class", "compare_graph_graph");

        // Planet infos banner background
        compare_graph.banner.background = compare_graph.graph.g.append("rect")
          .attr("class", 'banner_background')
          .attr("width", compare_graph.graph.lines.width)
          .attr("height", compare_graph.graph.lines.height)
          .attr("fill", "rgba(2, 20, 31, 0.62)")
          .attr("fill-opacity", 0);

        // Lines
        var planets_counter = 0;
        for(var planet in data.planets){

          var y_transform = planets_counter*compare_graph.graph.lines.height;

          var line = compare_graph.graph.g.append('g')
                .attr("transform", "translate(0, "+y_transform+")")
                .attr("class", "line "+planet);

          line.append("rect")
                .attr("width", compare_graph.graph.lines.width)
                .attr("height", compare_graph.graph.lines.height)
                .attr("fill-opacity", 0);

          var line_params = {
            x1 : 0,
            y1 : compare_graph.graph.lines.height/2,
            x2 : compare_graph.graph.lines.width,
            y2 : compare_graph.graph.lines.height/2
          }

          // Background line
          line.append("line")
                .attr("x1", line_params.x1)
                .attr("y1", line_params.y1)
                .attr("x2", line_params.x2)
                .attr("y2", line_params.y2)
                .attr('stroke', 'rgb(17,58,79)')
                .attr('stroke-width', 1);


          var planet_name = {
            text : params.translations.views.planets[planet].planet_name,
            x : 10,
            y : compare_graph.graph.lines.height/2
          }
          line.append("text")
              .attr("class", "planet_name")
              .text(planet_name.text)
              .attr("transform", "translate("+planet_name.x+", "+planet_name.y+")")
              .attr("style", "dominant-baseline: central;")
              .attr("fill", "rgba(255, 255, 255, 1)");

          planets_counter++;
        }


        // Planet infos banner container
        compare_graph.banner.g = compare_graph.graph.g.append('g')
            .attr("class", "banner_content")
            .style("opacity", 0);

        compare_graph.banner.g.append("text")
              .attr("class", "banner_value")
              .attr("transform", "translate(0, "+(compare_graph.graph.lines.height/2)+")")
              .attr("style", "text-anchor: end; dominant-baseline: central;")
              .attr("fill", "rgba(255, 255, 255, 1)");

        compare_graph.banner.g.append("text")
              .attr("class", "banner_compare")
              .attr("transform", "translate(0, "+(compare_graph.graph.lines.height/2)+")")
              .attr("style", "text-anchor: start; dominant-baseline: central;")
              .attr("fill", "rgba(255, 255, 255, 1)");  


        // Select planet compare with   

        compare_graph.banner.select = compare_graph.banner.g.append('g')
            .attr("class", "banner_select");

        var select_label_params = {
          text : params.translations.views.compare_graph.select_label,
          x : compare_graph.params.width-10,
          y : compare_graph.graph.lines.height/2-compare_graph.graph.lines.height/8
        }

        compare_graph.banner.select.append("text")
              .attr("class", "select_label")
              .attr("transform", "translate("+select_label_params.x+", "+select_label_params.y+")")
              .text(select_label_params.text)
              .attr("style", "text-anchor: end; dominant-baseline: central;")
              .attr("fill", "rgba(255, 255, 255, 1)");

        // select
        compare_graph.banner.select_g = compare_graph.banner.select.append('g')
            .attr("class", "banner_select_g");

        var select_value_params = {
          text : params.translations.views.planets[localStorage.getItem('planet_compare')].planet_name,
          x : compare_graph.params.width-35,
          y : compare_graph.graph.lines.height/2+compare_graph.graph.lines.height/8
        }

        compare_graph.banner.select_g.append("text")
          .attr("class", "select_value")
          .attr("transform", "translate("+select_value_params.x+", "+select_value_params.y+")")
          .text(select_value_params.text)
          .attr("data-x", select_value_params.x)
          .attr("data-y", select_value_params.y)
          .attr("style", "text-anchor: end; dominant-baseline: central;")
          .attr("fill", "rgba(255, 255, 255, 1)")
          .on('click', function(){
            select_planet_reference.call(this);
          });

        var icon_params = {
          width : 14,
          height : 7
        }
        icon_params.y = select_value_params.y - icon_params.height/2;
        icon_params.x = compare_graph.params.width-icon_params.width-10;

        compare_graph.banner.select_g.append("image")
          .attr("class", 'select_icon')
          .attr("width", icon_params.width)
          .attr("height", icon_params.height)
          .attr("transform", "translate("+icon_params.x+", "+icon_params.y+")")
          .attr("data-transform", "translate("+icon_params.x+", "+icon_params.y+")")
          .attr("xlink:href", "assets/images/icons/arrow-bottom.svg")
          .on('click', function(){
            select_planet_reference.call(this);
          });

        // select list
        compare_graph.banner.select_list = compare_graph.banner.select.append('g')
          .attr("class", "banner_select_list")
          .style('opacity', 0);


        var select_planet_reference = function(){
          if(!compare_graph.banner.select_list.node().classList.contains('open')){
            open_select_reference_list.call(this);
          }else{
            close_select_reference_list.call(this);
          }
        }

        var open_select_reference_list = function(){
          // Remove old elements
          compare_graph.banner.select_list.selectAll('text').remove();

          var current_planet = localStorage.getItem('planet_compare');
          var select_value = compare_graph.banner.select_g.select('.select_value');
          var select_item_params = {
            x : parseFloat(select_value.attr('data-x')),
            y : parseFloat(select_value.attr('data-y')),
          }

          for(var planet in data.planets){

            select_item_params.text = params.translations.views.planets[planet].planet_name;
            select_item_params.y += compare_graph.graph.lines.height/4;

            compare_graph.banner.select_list.append("text")
              .attr("class", "select_item")
              .attr("data-name", planet)
              .attr("transform", "translate("+select_item_params.x+", "+select_item_params.y+")")
              .text(select_item_params.text)
              .attr("style", "text-anchor: end; dominant-baseline: central;")
              .attr("fill", "rgba(255, 255, 255, 1)")
              .on('click', function(){
                var planet_name = d3.select(this).attr('data-name');
                change_planet_reference.call(this, planet_name);
              }).on('mouseover', function(){
                d3.select(this).attr("fill", "rgba(143, 143, 143, 1)")
              }).on('mouseout', function(){
                d3.select(this).attr("fill", "rgba(255, 255, 255, 1)")
              });

          }

          compare_graph.banner.select_list
            .transition()
            .duration(300)
            .style('opacity', 1);

          var select_icon = compare_graph.banner.select_g.select('.select_icon');
          var select_icon_params = {
            rotate : {
              r : -180,
              x : select_icon.attr('width')/2,
              y : select_icon.attr('height')/2
            }
          }
          var select_icon_transform = select_icon.attr('data-transform')+' rotate('+select_icon_params.rotate.r+', '+select_icon_params.rotate.x+', '+select_icon_params.rotate.y+')';
          select_icon
            .transition()
            .duration(300)
            .attr('transform', select_icon_transform);
          compare_graph.banner.select_list.classed('open', true);
        }

        var close_select_reference_list = function(){
          compare_graph.banner.select_list
            .transition()
            .duration(300)
            .style('opacity', 0);

          var select_icon = compare_graph.banner.select_g.select('.select_icon');
          var select_icon_params = {
            rotate : {
              r : 0,
              x : select_icon.attr('width')/2,
              y : select_icon.attr('height')/2
            }
          }
          var select_icon_transform = select_icon.attr('data-transform')+' rotate('+select_icon_params.rotate.r+', '+select_icon_params.rotate.x+', '+select_icon_params.rotate.y+')';
          select_icon
            .transition()
            .duration(300)
            .attr('transform', select_icon_transform);

          compare_graph.banner.select_list.classed('open', false);
        }

        var change_planet_reference = function(compare_planet){

          localStorage.setItem('planet_compare', compare_planet);

          // update select value
          compare_graph.banner.select_g.select('.select_value')
            .text(params.translations.views.planets[compare_planet].planet_name);

          // update comparator banner value
          var banner_compare = compare_graph.banner.g.select('.banner_compare');
          var planet_name = banner_compare.attr('data-planet');
          var comparator_name = banner_compare.attr('data-comparator');

          var compare_value = data.planets[planet_name][comparator_name]/data.planets[compare_planet][comparator_name];
          compare_value = Math.round(compare_value*10)/10;
          compare_value = params.functions.formatNumber.call(this, compare_value, params.translations.views.global.number_separator);

          banner_compare.text(compare_value+' X '+params.translations.views.planets[compare_planet].planet_name);

          close_select_reference_list.call(this);
        }



        /* Comparators */
        var display_all_comparators =function(){
          d3.selectAll('.comparator').style('opacity', 1);
          hide_planet_comparator.call(this);
        }

        var hide_all_comparators =function(){
          d3.selectAll('.comparator').style('opacity', 0);

          // Close select of planet reference
          close_select_reference_list.call(this);
        }

        var display_comparator = function(comparator_name){
          hide_all_comparators.call(this);
          d3.selectAll('.'+comparator_name).style('opacity', 1);
        }

        var unselect_all_comparator_label = function(){
          var comparator_button = d3.selectAll('.comparator_button');
          
         unselect_comparator_label.call(this, comparator_button);

          d3.selectAll('.comparator_container').classed('click', false);
        }

        var unselect_comparator_label = function(comparator){
          var comparator_background = comparator.select('.comparator_background');
          comparator_background.attr("fill-opacity", 0);

          var comparator_label = comparator.select('.comparator_label');
          comparator_label.attr("fill", "rgba(36, 36, 36, 1)");

          var comparator_separator = comparator.select('.comparator_separator');
          comparator_separator.style("fill", "rgba(216, 213, 214, 1)");
        }

        var select_comparator_label = function(comparator){
          var comparator_background = comparator.select('.comparator_background');
          comparator_background.attr("fill-opacity", 1);

          var comparator_label = comparator.select('.comparator_label');
          comparator_label.attr("fill", "rgba(257, 247, 245, 1)");

          var comparator_separator = comparator.select('.comparator_separator');
          comparator_separator.style("fill", "rgba(36, 36, 36, 1)");
        }

        var display_planet_comparator = function(planet){
          var planet_name = planet.attr('data-planet');
          var comparator = d3.select(this.parentNode);
          var comparator_name = comparator.attr("data-comparator");

          var background_params = {
            x : 0,
            y : planet.attr('data-y')
          }

          compare_graph.banner.background
            .transition()
            .duration(300)
            .attr("transform", "translate("+background_params.x+","+background_params.y+")")
            .attr("fill-opacity", 1);

           compare_graph.banner.g
              .transition()
              .duration(300)
              .attr("transform", "translate(0, "+background_params.y+")")
              .style("opacity", 1);

          var comparator_value = compare_value = params.functions.formatNumber.call(this, data.planets[planet_name][comparator_name], params.translations.views.global.number_separator);
          var banner_value_params = {
            text : comparator_value+' '+params.translations.views.compare_graph.comparators[comparator_name].unit,
            x : parseFloat(comparator.attr('data-x'))+(compare_graph.graph.cols.width/2)-compare_graph.planets.max_size/1.5, // max height of a planet and margin
            y : compare_graph.graph.lines.height/2
          }

          var compare_planet = localStorage.getItem('planet_compare');
          var compare_value = data.planets[planet_name][comparator_name]/data.planets[compare_planet][comparator_name];
          compare_value = Math.round(compare_value*10)/10;
          compare_value = params.functions.formatNumber.call(this, compare_value, params.translations.views.global.number_separator);

          var banner_compare_params = {
            text : compare_value+' X '+params.translations.views.planets[compare_planet].planet_name,
            x : parseFloat(comparator.attr('data-x'))+(compare_graph.graph.cols.width/2)+compare_graph.planets.max_size/1.5, // max height of a planet and margin
            y : banner_value_params.y
          }

          compare_graph.banner.g.select('.banner_value')
            .transition()
            .duration(300)
            .text(banner_value_params.text)
            .attr("transform", "translate("+banner_value_params.x+", "+banner_value_params.y+")");

          compare_graph.banner.g.select('.banner_compare')
            .transition()
            .duration(300)
            .text(banner_compare_params.text)
            .attr("data-planet", planet_name)
            .attr("data-comparator", comparator_name)
            .attr("transform", "translate("+banner_compare_params.x+", "+banner_compare_params.y+")");

          
        }

        var hide_planet_comparator = function(){
          compare_graph.banner.background
            .transition()
            .duration(300)
            .attr("fill-opacity", 0);

          compare_graph.banner.g
              .transition()
              .duration(300)
              .style("opacity", 0);
        }

        // Get comparators values for each planet (and get min and max planet)
        for(var comparator in compare_graph.comparators){
          for(var planet in data.planets){
            compare_graph.comparators[comparator][planet] = data.planets[planet][comparator];
            if(compare_graph.comparators[comparator].min==null 
              || compare_graph.comparators[comparator][compare_graph.comparators[comparator].min]>compare_graph.comparators[comparator][planet]){
              compare_graph.comparators[comparator].min = planet;
            }
            if(compare_graph.comparators[comparator].max==null 
              || compare_graph.comparators[comparator][compare_graph.comparators[comparator].max]<compare_graph.comparators[comparator][planet]){
              compare_graph.comparators[comparator].max = planet;
            }
          }
        }


        var y_transform = planets_counter*compare_graph.graph.lines.height+compare_graph.graph.margin.bottom;
        var comparators_g = compare_graph.graph.g.append('g')
              .attr("transform", "translate(0, "+y_transform+")")
              .attr("class", "comparators");

        // Bottom bar
        comparators_g.append("rect")
              .attr("width", compare_graph.graph.lines.width)
              .attr("height", compare_graph.sidebars.bottom.height)
              .style("fill", "rgba(257, 247, 245, 1)");



        var comparators_counter = 1;  // First column is planets name
        for(var comparator in compare_graph.comparators){

          var comparator_name = comparator;
          var comparator_label = params.translations.views.compare_graph.comparators[comparator_name].name;
          var x_tranform = comparators_counter*compare_graph.graph.cols.width;

          var comparator_col = compare_graph.graph.g.append('g')
              .attr("transform", "translate("+x_tranform+", 0)")
              .attr("class", "comparator "+comparator_name)
              .attr("data-x", x_tranform)
              .attr("data-comparator", comparator_name);

          /* Planets */
          var planets_counter = 0;
          for(var planet in data.planets){

            var y_tranform = planets_counter*compare_graph.graph.lines.height;
            var max_size = compare_graph.planets.max_size;

            // planet_size = (((val - val_min)/(val_max-val_min))*(80-5))+5
            var planet_size = (((data.planets[planet][comparator_name]-data.planets[compare_graph.comparators[comparator].min][comparator_name])/(data.planets[compare_graph.comparators[comparator].max][comparator_name]-data.planets[compare_graph.comparators[comparator].min][comparator_name]))*(max_size-5))+5;

            var planet_params = {
              width : planet_size,
              height : planet_size
            }
            planet_params.x = compare_graph.graph.cols.width/2-planet_params.width/2; 
            planet_params.y = compare_graph.graph.lines.height/2-planet_params.height/2+y_tranform; 

            var planet_image = comparator_col.append("image")
              .attr("class", "planet "+planet)
              .attr("data-planet", planet)
              .attr("width", planet_params.width)
              .attr("height", planet_params.height)
              .attr("data-width", planet_params.width)
              .attr("data-height", planet_params.width)
              .attr("data-y", y_tranform)
              .attr("transform", "translate("+planet_params.x+","+planet_params.y+")")
              .attr("xlink:href", "assets/images/planets/"+planet+".svg");

            // Enlarge planet on mouseover
            planet_image.on('mouseover', function(){
              var planet = d3.select(this);
              var planet_params = {
                width : parseFloat(planet.attr("data-width")),
                height : parseFloat(planet.attr("data-height"))
              }
              planet_params.width = planet_params.width+compare_graph.graph.lines.height*(20/100);
              planet_params.height = planet_params.height+compare_graph.graph.lines.height*(20/100);
              planet_params.x = compare_graph.graph.cols.width/2-planet_params.width/2; 
              planet_params.y = compare_graph.graph.lines.height/2-planet_params.height/2+parseFloat(planet.attr("data-y")); 

              planet.transition()
                    .duration(300)
                    .attr("width", planet_params.width)
                    .attr("height", planet_params.height)
                    .attr("transform", "translate("+planet_params.x+","+planet_params.y+")");
            });

            // Reduce planet on mouseout
            planet_image.on('mouseout', function(){
              var planet = d3.select(this);
              var planet_params = {
                width : parseFloat(planet.attr("data-width")),
                height : parseFloat(planet.attr("data-height"))
              }
              planet_params.x = compare_graph.graph.cols.width/2-planet_params.width/2; 
              planet_params.y = compare_graph.graph.lines.height/2-planet_params.height/2+parseFloat(planet.attr("data-y")); 

              planet.transition()
                    .duration(300)
                    .attr("width", planet_params.width)
                    .attr("height", planet_params.height)
                    .attr("transform", "translate("+planet_params.x+","+planet_params.y+")");
            });

            // Click
            planet_image.on('click', function(){
              var planet = d3.select(this);
              var comparator = d3.select(this.parentNode);
              var comparator_name = comparator.attr("data-comparator");
              
              // If current comparator isn't already clicked
              if(!this.classList.contains("click")) {

                var comparator_label = d3.select(d3.select('#'+comparator_name).node().parentNode);
                select_comparator_label.call(this, comparator_label);

                // Display comparator column
                display_comparator.call(this, comparator_name);
                d3.selectAll('.planet').classed('click', false);
                planet.classed('click', true);

                display_planet_comparator.call(this, planet);

              }else{
                // Remove labels selections
                unselect_all_comparator_label.call(this);

                display_all_comparators.call(this);
                d3.selectAll('.planet').classed('click', false);
              }
            });

            planets_counter++;
          }




          /* Bottom bar */
          var comparator_g = comparators_g.append('g')
              .attr("transform", "translate("+x_tranform+", 0)")
              .attr("class", "comparator_button");

          // Background
          comparator_g.append("rect")
              .attr("width", compare_graph.graph.cols.width)
              .attr("height", compare_graph.sidebars.bottom.height)
              .attr("class", "comparator_background")
              .attr("fill", "rgba(36, 36, 36, 1)")
              .attr("fill-opacity", 0);

          // Separator
          comparator_g.append("rect")
              .attr("width", 1)
              .attr("height", compare_graph.sidebars.bottom.height)
              .attr("class", "comparator_separator")
              .style("fill", "rgba(216, 213, 214, 1)");

          // Comparator name
          var x_tranform = compare_graph.graph.cols.width/2;
          var y_tranform = compare_graph.sidebars.bottom.height/2;
          comparator_g.append("text")
              .attr("class", "comparator_label")
              .text(comparator_label)
              .attr("transform", "translate("+x_tranform+", "+y_tranform+")")
              .attr("style", "text-anchor: middle; dominant-baseline: central;")
              .attr("fill", "rgba(36, 36, 36, 1)");

          // Hover container
          var comparator_container = comparator_g.append("rect")
              .attr("width", compare_graph.graph.cols.width)
              .attr("height", compare_graph.sidebars.bottom.height)
              .attr("class", 'comparator_container')
              .attr("id", comparator_name)
              .attr("fill-opacity", 0);

          comparator_container.on('mouseover', function(){
            var comparator_label = d3.select(this.parentNode);
            // Add selection on current label
            select_comparator_label.call(this, comparator_label);
          });

          comparator_container.on('mouseout', function(){
            var comparator_label = d3.select(this.parentNode);
            // If current label is not clicked
            if(!this.classList.contains("click")) {
              unselect_comparator_label.call(this, comparator_label);
            }
          });

          comparator_container.on('click', function(){

            // If current comparator isn't already clicked
            if(!this.classList.contains("click")) {
              // Remove other label selection's
              unselect_all_comparator_label.call(this);

              // Add selection on current label
              var comparator = d3.select(this);
              var comparator_label = d3.select(this.parentNode);
              select_comparator_label.call(this, comparator_label);

              // Display comparator column
              var comparator_name = d3.select(this).attr('id');
              display_comparator.call(this, comparator_name);
              comparator.classed('click', true);

              // Hide comparator banner
              hide_planet_comparator.call(this);
            }else{
              // Remove labels selections
              unselect_all_comparator_label.call(this);

              display_all_comparators.call(this);

              // Hide comparator banner
              hide_planet_comparator.call(this);
            }
          });

          comparators_counter++;
        }

        /* All planets */
        var x_tranform = comparators_counter*compare_graph.graph.cols.width;
        var display_all_g = compare_graph.graph.g.append('g')
              .attr("transform", "translate("+x_tranform+", "+y_transform+")")
              .attr("class", "display_all");

        // Separator
        display_all_g.append("rect")
            .attr("width", 1)
            .attr("height", compare_graph.sidebars.bottom.height)
            .style("fill", "rgba(216, 213, 214, 1)");

        var icon_params = {
          height : compare_graph.sidebars.bottom.height/2,
        }
        icon_params.width = icon_params.height/(56/100); // use image ratio
        icon_params.x = icon_params.width/2;
        icon_params.y = compare_graph.sidebars.bottom.height/2-icon_params.height/2;

        display_all_g.append("image")
            .attr("class", 'icon')
            .attr("width", icon_params.width)
            .attr("height", icon_params.height)
            .attr("transform", "translate("+icon_params.x+", "+icon_params.y+")")
            .attr("xlink:href", "assets/images/icons/all_planets.svg");

        // Click container
        var display_all_container = display_all_g.append("rect")
            .attr("class", "display_all_container")
            .attr("width", compare_graph.graph.cols.width)
            .attr("height", compare_graph.sidebars.bottom.height)
            .attr("fill-opacity", 0);

        display_all_container.on('click', function(){
            // Remove labels selections
            unselect_all_comparator_label.call(this);

            display_all_comparators.call(this);

            // Hide comparator banner
            hide_planet_comparator.call(this);
        });


      });
    },
    close: function(view){
      //if(view.animation_timer) clearInterval(view.animation_timer);
    }
  });
  return CompareGraphView;
});