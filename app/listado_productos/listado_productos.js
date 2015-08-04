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


    ListadoProductosController.$inject = ['ProductosService', '$location', 'AcUtilsGlobals', '$rootScope',
    '$timeout'];
    function ListadoProductosController(ProductosService, $location, AcUtilsGlobals, $rootScope,
    $timeout) {

        var vm = this;

        vm.productos = [];
        vm.itemsByPage = 10;
        vm.detalle = detalle;

        function detalle(id){
            $location.path('/productos/'+id);
        }
        AcUtilsGlobals.isWaiting = true;
        $rootScope.$broadcast('IsWaiting');
        ProductosService.getProductos(
            function (data){
                //console.log(data);
                vm.productos = data;
                //console.log(vm.productos);
                //$timeout(function(){
                //    AcUtilsGlobals.isWaiting = false;
                //    $rootScope.$broadcast('IsWaiting');
                //}, 1500);


            }
        );

    }

    ListadoProductosService.$inject = ['$http'];
    function ListadoProductosService($http){
        var service = {};

        return service;

    }

})();