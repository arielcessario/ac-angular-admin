(function () {
    'use strict';

    angular.module('nombreapp.stock.consultaStock', ['ngRoute', 'toastr'
    ,'nombreapp.stock.sucursales'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/consulta_stock', {
                templateUrl: './consulta_stock/consulta_stock.html',
                controller: 'ConsultaStockController'
            });
        }])

        .controller('ConsultaStockController', ConsultaStockController)
        .service('ConsultaStockService', ConsultaStockService);


    ConsultaStockController.$inject = ['$location', 'ConsultaStockService', 'toastr', 'SucursalesService'];
    function ConsultaStockController($location, ConsultaStockService, toastr, SucursalesService) {

        var vm = this;
        vm.updateStock = updateStock;

        vm.stocks = [];
        vm.todos = [];
        vm.sucursales= [];
        vm.sucursal = {};
        vm.conStock = true;
        vm.filtroSucursal = filtroSucursal;
        vm.loadConStock = loadConStock;




        SucursalesService.getSucursales(function(data){
            //console.log(data);

            vm.sucursales = data;
            vm.sucursales.push({sucursal_id: -1, nombre: "Todas", direccion: "", telefono: ""});
            vm.sucursal = vm.sucursales[vm.sucursales.length-1];

            ConsultaStockService.getStock(function (data) {
                vm.todos = data;
                loadConStock();
            });

        });

        function updateStock(stock){
            ConsultaStockService.updateStock(stock, function(data){
                //console.log(data);
                toastr.success('Stock modificado con exito.')


            })
        }

        function loadConStock(){


            if(vm.conStock){
                ConsultaStockService.getConStock(function (data) {
                    vm.todos = data;
                    filtroSucursal();
                });
            }else{
                ConsultaStockService.getStock(function (data) {
                    vm.todos = data;
                    filtroSucursal();
                });
            }


        }

        function filtroSucursal(){

            if(vm.sucursal.sucursal_id !== -1){
                var results = vm.todos.filter(function(elem, index, array){
                    return elem.sucursal_id == vm.sucursal.sucursal_id;
                });

                vm.stocks = results;
            }else{
                vm.stocks = vm.todos;
            }

        }
    }

    ConsultaStockService.$inject = ['$http'];
    function ConsultaStockService($http) {
        var url = './stock-api/stock.php';
        var service = {};

        service.getStock = getStock;
        service.getConStock = getConStock;
        service.updateStock = updateStock;

        return service;

        function getStock(callback) {
            $http.post(url,
                {function: 'getStock'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function(data){});
        }

        function getConStock(callback){
            getStock(function(data){
               var response = data.filter(function(elem, index, array){

                   //console.log(elem.cant_actual > 0);
                   return elem.cant_actual > 0;

               }) ;

                callback(response);
            });
        }

        function updateStock(stock, callback){
            //console.log(stock);
            $http.post(url,
                {function: 'updateStock', stock: JSON.stringify(stock)},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function(data){});
        }

    }

})();