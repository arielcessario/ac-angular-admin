(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoVentasWeb', ['ngRoute', 'nombreapp.stock.ventasWeb',
        'acAngularLoginClient'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_ventas_web', {
                templateUrl: './listado_ventas_web/listado_ventas_web.html',
                controller: 'ListadoVentasWebController'
            });
        }])

        .controller('ListadoVentasWebController', ListadoVentasWebController)
        .service('ListadoVentasWebService', ListadoVentasWebService);


    ListadoVentasWebController.$inject = ['acAngularLoginClientService', 'VentasWebService', '$location', '$timeout'];
    function ListadoVentasWebController(acAngularLoginClientService, VentasWebService, $location, $timeout) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.detalle = detalle;
        vm.ventas_web = [];
        vm.todos = todos;
        vm.soloActivos={};
        vm.soloActivos.status = 2;

        function todos() {
            vm.soloActivos.status = (vm.soloActivos.status == 2) ? undefined : 2;
        }


        VentasWebService.getVentasSinConfirmar(function (data) {
            console.log(data);
        });

        function detalle(id) {

            $location.path('/ventas_web/' + id);
        }


        VentasWebService.getVentasWeb(
            function (data) {
                //console.log(data);
                //vm.clientes = data;

                vm.ventas_web = data;
                //console.log(vm.clientes);
            }
        );

    }

    ListadoVentasWebService.$inject = ['$http'];
    function ListadoVentasWebService($http) {
        var service = {};

        return service;

    }

})();