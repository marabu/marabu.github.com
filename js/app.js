// 'use strict';

// Declare app level module which depends on filters, and services
angular.module('marabu', ['marabu.filters', 'marabu.services', 'marabu.directives']).
  config([ '$routeProvider', function($routeProvider) {
  
    $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: HomeCtrl});
    $routeProvider.when('/debugger', {templateUrl: 'partials/debugger.html', controller: DebuggerCtrl});
    $routeProvider.when('/view', {templateUrl: 'partials/viewer.html', controller: ViewerCtrl});
    $routeProvider.when('/accounts', {templateUrl: 'partials/accounts.html', controller: AccountsCtrl});
    $routeProvider.when('/reset', {templateUrl: 'partials/reset.html', controller: AccountsCtrl});
    $routeProvider.otherwise({redirectTo: '/home'});  
    
}]);
