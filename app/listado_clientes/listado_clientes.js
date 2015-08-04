(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoClientes', ['ngRoute', 'nombreapp.stock.clientes',
        'acAngularLoginClient'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_clientes', {
                templateUrl: './listado_clientes/listado_clientes.html',
                controller: 'ListadoClientesController'
            });
        }])

        .controller('ListadoClientesController', ListadoClientesController)
        .service('ListadoClientesService', ListadoClientesService);


    ListadoClientesController.$inject = ['acAngularLoginClientService', 'ClientesService', '$location', 'AcUtilsGlobals', '$rootScope'];
    function ListadoClientesController(acAngularLoginClientService, ClientesService, $location, AcUtilsGlobals, $rootScope) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.clientes = [];
        vm.detalle = detalle;

        function detalle(id) {
            $location.path('/clientes/' + id);
        }

        AcUtilsGlobals.isWaiting = true;
        $rootScope.$broadcast('IsWaiting');
        ClientesService.getClientes(
            function (data) {
                //console.log(data);
                vm.clientes = data;
                //console.log(vm.clientes);
                AcUtilsGlobals.isWaiting = false;
                $rootScope.$broadcast('IsWaiting');
            }
        )
        ;

    }

    ListadoClientesService.$inject = ['$http'];
    function ListadoClientesService($http) {
        var service = {};

        return service;

    }

})();