'use strict';

/* Filters */

angular.module('marabu.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]).
  filter( 'nbBug', function() {
    return function( input ) {
        return "http://netbeans.org/bugzilla/show_bug.cgi?id=" + input;
    };  
  });
