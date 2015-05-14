(function () {
    'use strict';

    angular.module('nombreapp.stock.resultados', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/resultados', {
                templateUrl: './resultados/resultados.html',
                controller: 'ResultadosController'
            });
        }])

        .controller('ResultadosController', ResultadosController)
        .service('ResultadosService', ResultadosService);


    ResultadosController.$inject = [];
    function ResultadosController() {

        var vm = this;

    }

    ResultadosService.$inject = ['$http'];
    function ResultadosService($http){
        var service ={};
        var url = './stock-api/resultados.php';
        service.getResultados = getResultados;
        return service;

        function getResultados(callback){
            return $http.get(url + '?function=getResultados')
                .success(function(data){
                    callback(data);
                })
                .error(function(data){
                    callback(data);
                })
        }
    }


})();