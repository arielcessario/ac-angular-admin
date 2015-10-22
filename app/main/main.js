(function () {

    'use strict';


    angular.module('stock.main', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {
                templateUrl: './main/main.html',
                controller: 'MainController',
                data: {requiresLogin:true}
            });
        }])

        .controller('MainController', MainController);

    MainController.$inject = [];
    function MainController() {
        var vm = this;



    }


})();

