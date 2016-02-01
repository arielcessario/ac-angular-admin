(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoSucursales', ['ngRoute', 'nombreapp.stock.sucursales'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_sucursales', {
                templateUrl: './listado_sucursales/listado_sucursales.html',
                controller: 'ListadoSucursalesController',
                data: {requiresLogin: true}
            });
        }])

        .controller('ListadoSucursalesController', ListadoSucursalesController);


    ListadoSucursalesController.$inject = ['SucursalesService', '$location'];
    function ListadoSucursalesController(SucursalesService, $location) {

        var vm = this;

        vm.sucursales = [];
        vm.detalle = detalle;
        vm.soloActivos = true;
        vm.loadSucursales = loadSucursales;

        loadSucursales();


        function detalle(id) {
            $location.path('/sucursales/' + id);
        }


        function loadSucursales() {


            SucursalesService.get(
                function (data) {
                    for(var i = 0; i < data.length; i++){
                        vm.sucursales.push(data[i]);
                    }
                }
            );
        }


    }


})();