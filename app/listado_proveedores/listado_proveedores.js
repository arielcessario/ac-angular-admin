(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoProveedores', ['ngRoute', 'nombreapp.stock.proveedores',
        'acAngularLoginClient'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_proveedores', {
                templateUrl: './listado_proveedores/listado_proveedores.html',
                controller: 'ListadoProveedoresController',
                data: {requiresLogin: true}
            });
        }])

        .controller('ListadoProveedoresController', ListadoProveedoresController)
        .service('ListadoProveedoresService', ListadoProveedoresService);


    ListadoProveedoresController.$inject = ['acAngularLoginClientService', 'ProveedoresService', '$location', 'AcUtilsGlobals', '$rootScope'];
    function ListadoProveedoresController(acAngularLoginClientService, ProveedoresService, $location, AcUtilsGlobals, $rootScope) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.proveedores = [];
        vm.detalle = detalle;

        function detalle(id) {
            $location.path('/proveedores/' + id);
        }

        AcUtilsGlobals.isWaiting = true;
        $rootScope.$broadcast('IsWaiting');
        ProveedoresService.getProveedores(
            function (data) {
                console.log(data);
                vm.proveedores = data;
                //console.log(vm.proveedores);
                AcUtilsGlobals.isWaiting = false;
                $rootScope.$broadcast('IsWaiting');
            }
        )
        ;

    }

    ListadoProveedoresService.$inject = ['$http'];
    function ListadoProveedoresService($http) {
        var service = {};

        return service;

    }

})();