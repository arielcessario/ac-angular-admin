(function(){
    'use strict';

    angular.module('nombreapp.stock.listadoProductos', ['ngRoute', 'nombreapp.stock.productos'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/listado_productos', {
                templateUrl: './listado_productos/listado_productos.html',
                controller: 'ListadoProductosController'
            });
        }])

        .controller('ListadoProductosController', ListadoProductosController)
        .service('ListadoProductosService',ListadoProductosService);


    ListadoProductosController.$inject = ['ProductosService', '$location'];
    function ListadoProductosController(ProductosService, $location) {

        var vm = this;

        vm.productos = [];
        vm.detalle = detalle;

        function detalle(id){
            $location.path('/productos/'+id);
        }

        ProductosService.getProductos(
            function (data){
                //console.log(data);
                vm.productos = data;
                //console.log(vm.productos);
            }
        );

    }

    ListadoProductosService.$inject = ['$http'];
    function ListadoProductosService($http){
        var service = {};

        return service;

    }

})();