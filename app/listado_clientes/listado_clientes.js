(function(){
    'use strict';

    angular.module('nombreapp.stock.listadoClientes', ['ngRoute', 'nombreapp.stock.clientes',
        'acAngularLoginClient'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/listado_clientes', {
                templateUrl: './listado_clientes/listado_clientes.html',
                controller: 'ListadoClientesController'
            });
        }])

        .controller('ListadoClientesController', ListadoClientesController)
        .service('ListadoClientesService',ListadoClientesService);


    ListadoClientesController.$inject = ['acAngularLoginClientService','ClientesService', '$location'];
    function ListadoClientesController(acAngularLoginClientService, ClientesService, $location) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.clientes = [];
        vm.detalle = detalle;

        function detalle(id){
            $location.path('/clientes/'+id);
        }

        ClientesService.getClientes(
            function (data){
                //console.log(data);
                vm.clientes = data;
                //console.log(vm.clientes);
            }
        );

    }

    ListadoClientesService.$inject = ['$http'];
    function ListadoClientesService($http){
        var service = {};

        return service;

    }

})();