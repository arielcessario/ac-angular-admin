(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoProductos', ['ngRoute', 'nombreapp.stock.productos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_productos', {
                templateUrl: './listado_productos/listado_productos.html',
                controller: 'ListadoProductosController'
            });
        }])

        .controller('ListadoProductosController', ListadoProductosController)
        .service('ListadoProductosService', ListadoProductosService);


    ListadoProductosController.$inject = ['ProductosService', '$location', 'AcUtilsGlobals', '$rootScope',
        '$timeout'];
    function ListadoProductosController(ProductosService, $location, AcUtilsGlobals, $rootScope,
                                        $timeout) {

        var vm = this;

        vm.productos = [];
        vm.detalle = detalle;
        vm.avanzar = avanzar;
        vm.retroceder = retroceder;
        vm.irAPagina = irAPagina;
        vm.page = 0;
        vm.list_length = 0;
        vm.todos = [];
        vm.start = 0;
        vm.limit = 10;
        vm.lastView = 0;
        vm.paginas = 0;
        vm.pagina = 1;


        function irAPagina(){

            if(vm.pagina <1 ){
                vm.pagina = 1;
                return;
            }

            if(vm.pagina > vm.paginas){
                vm.pagina = vm.paginas;
                return;
            }

            vm.start = vm.pagina * 10;
            vm.lastView = vm.start;
        }

        function detalle(id) {
            $location.path('/productos/' + id);
        }

        function avanzar() {

            if(vm.pagina + 1 > vm.paginas){
                return;
            }

            vm.start = (vm.pagina + 0) * 10;
            vm.pagina = vm.pagina + 1;
            vm.lastView = vm.start;
        }

        function retroceder() {
            if(vm.pagina - 2 <= 0){
                return;
            }
            vm.start = (vm.pagina -2 ) * 10;
            vm.pagina = vm.pagina - 1;
            vm.lastView = vm.start;
        }

        AcUtilsGlobals.isWaiting = true;
        $rootScope.$broadcast('IsWaiting');
        ProductosService.getProductos(
            function (data) {
                //console.log(data);
                vm.productos = data;

                vm.paginas = parseInt(data.length / 10);
                //for(var i = 0; i<data.length / 10; i++){
                //    vm.paginas.push({numero:i});
                //}
                //vm.paginas = data.length /10;
                //console.log(vm.paginas);

                //vm.todos = data.slice(0);
                //vm.productos = data.slice(vm.page, vm.itemsByPage);
                //vm.list_length = data.length / vm.itemsByPage;
                //console.log(vm.productos);
                //$timeout(function(){
                //    AcUtilsGlobals.isWaiting = false;
                //    $rootScope.$broadcast('IsWaiting');
                //}, 1500);


            }
        );

    }

    ListadoProductosService.$inject = ['$http'];
    function ListadoProductosService($http) {
        var service = {};

        return service;

    }

})();