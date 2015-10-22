(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoProductos', [])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_productos', {
                templateUrl: './listado_productos/listado_productos.html',
                controller: 'ListadoProductosController'
            });
        }])

        .controller('ListadoProductosController', ListadoProductosController)
        .service('ListadoProductosService', ListadoProductosService);


    ListadoProductosController.$inject = ['ProductService', '$location', 'AcUtilsGlobals', '$rootScope',
        '$timeout', 'ProductVars'];
    function ListadoProductosController(ProductService, $location, AcUtilsGlobals, $rootScope,
                                        $timeout, ProductVars) {

        var vm = this;

        vm.productos = [];
        vm.detalle = detalle;


        // Implementación de la paginación
        vm.start = 0;
        vm.end = ProductVars.paginacion;
        vm.pagina = ProductVars.pagina;
        vm.paginas = ProductVars.paginas;
        vm.next = function () {
            vm.start = ProductService.next().start;
            vm.pagina = ProductVars.pagina;
        };
        vm.prev = function () {
            vm.start= ProductService.prev().start;
            vm.pagina = ProductVars.pagina;
        };
        vm.goToPagina = function () {
            vm.start= ProductService.goToPagina(vm.pagina).start;
        };

        function detalle(id) {
            $location.path('/productos/' + id);
        }



        AcUtilsGlobals.isWaiting = true;
        $rootScope.$broadcast('IsWaiting');
        ProductService.get(
            function (data) {
                vm.productos = data;
                vm.paginas = ProductVars.paginas;

                //vm.paginas = parseInt(data.length / 10);
                //for(var i = 0; i<data.length / 10; i++){
                //    vm.paginas.push({numero:i});
                //}
                //vm.paginas = data.length /10;
                //console.log(vm.paginas);

                //vm.todos = data.slice(0);
                //vm.productos = data.slice(vm.page, vm.itemsByPage);
                //vm.list_length = data.length / vm.itemsByPage;
                //console.log(vm.productos);
                $timeout(function(){
                    AcUtilsGlobals.isWaiting = false;
                    $rootScope.$broadcast('IsWaiting');
                }, 1500);


            }
        );

    }

    ListadoProductosService.$inject = ['$http'];
    function ListadoProductosService($http) {
        var service = {};

        return service;

    }

})();