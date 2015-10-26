(function () {

    'use strict';


    angular.module('nombreapp.stock.trasladarStock', ['ngRoute', 'toastr', 'acMovimientos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/trasladar_stock', {
                templateUrl: './trasladar_stock/trasladar_stock.html',
                controller: 'TrasladarStockController'
            });
        }])

        .controller('TrasladarStockController', TrasladarStockController)
        .factory('TrasladarStockService', TrasladarStockService);

    TrasladarStockController.$inject = ["$rootScope", "$location", 'ProductService', 'SucursalesService', 'TrasladarStockService', 'AcUtilsGlobals',
        'toastr', 'ProductVars', 'StockService'];
    function TrasladarStockController($rootScope, $location, ProductService, SucursalesService, TrasladarStockService, AcUtilsGlobals,
                                      toastr, ProductVars, StockService) {
        var vm = this;
        vm.producto = {};
        vm.sucursales = [];
        vm.origen_id = 0;
        vm.destino_id = 0;
        vm.cantidad_disponible = 0;
        vm.save = save;
        vm.calc_disponible = calc_disponible;
        vm.setSucursalOrigen = setSucursalOrigen;
        vm.controlarCantidad = controlarCantidad;

        SucursalesService.get(function (data) {
            vm.sucursales = data;
            //vm.sucursales_destino = data;

        });

        function controlarCantidad() {
            if (vm.cantidad > vm.cantidad_disponible) {
                toastr.error('La cantidad seleccionada es mayor a la disponible');
                vm.cantidad = vm.cantidad_disponible;
            }
        }

        function setSucursalOrigen() {
            AcUtilsGlobals.sucursal_auxiliar_id = vm.origen_id;
            //console.log(AcUtilsGlobals.sucursal_auxiliar_id);
        }

        // Esto es un listener de la directiva search-panel
        AcUtilsGlobals.listenPanel(calc_disponible);

        function calc_disponible() {
            //console.log(vm.producto);
            if (vm.producto.stock == undefined) {
                return;
            }
            vm.cantidad_disponible = 0;
            for (var i = 0; i < vm.producto.stock.length; i++) {
                if (vm.producto.stock[i].sucursal_id == AcUtilsGlobals.sucursal_auxiliar_id) {
                    vm.cantidad_disponible = vm.producto.stock[i].cant_actual + vm.cantidad_disponible;
                }

            }
        }

        function save() {
            AcUtilsGlobals.isWaiting = true;
            $rootScope.$broadcast('IsWaiting');
            if(vm.destino_id == vm.origen_id){
                toastr.error('La sucursal de origen y destino no pueden ser las mismas');
                return;
            }

            StockService.trasladar(vm.origen_id, vm.destino_id, vm.producto.producto_id, vm.cantidad, function (data) {
                //console.log(data);
                ProductVars.clearCache = true;
                ProductService.get(function(data){});
                //console.log(data);
                //if (data == ' ') {
                toastr.success('Traslado realizado con éxito');
                //vm.producto = {};
                //vm.origen_id = 0;
                //vm.destino_id = 0;
                //vm.cantidad_disponible = 0;
                $location.path('/consulta_stock');
                AcUtilsGlobals.isWaiting = false;
                $rootScope.$broadcast('IsWaiting');
                //}

            });
            //TrasladarStockService.save()
        }


    }


    TrasladarStockService.$inject = ['$http'];
    function TrasladarStockService($http) {
        var service = {};
        var url = './stock-api/stock.php';
        service.save = save;

        return service;


        function save(origen_id, destino_id, producto_id, cantidad, callback) {

            //console.log(origen_id);
            //console.log(destino_id);
            return $http.post(url,
                {
                    function: 'trasladar',
                    origen_id: origen_id,
                    destino_id: destino_id,
                    producto_id: producto_id,
                    cantidad: cantidad
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function(data){});
        }

    }

})();

