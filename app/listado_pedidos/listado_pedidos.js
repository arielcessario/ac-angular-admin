(function(){
    'use strict';

    angular.module('nombreapp.stock.listadoPedidos', ['ngRoute'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/listado_pedidos', {
                templateUrl: './listado_pedidos/listado_pedidos.html',
                controller: 'ListadoPedidosController'
            });
        }])

        .controller('ListadoPedidosController', ListadoPedidosController);


    ListadoPedidosController.$inject = ['PedidoService', '$location', 'PedidoVars'];
    function ListadoPedidosController(PedidoService, $location, PedidoVars) {

        var vm = this;

        vm.pedidos = [];
        vm.detalle = detalle;
        vm.soloActivos = true;
        vm.loadPedidos = loadPedidos;

        loadPedidos();


        function detalle(id){
            $location.path('/pedidos/'+id);
        }


        function loadPedidos(){
            if(vm.soloActivos){
                PedidoVars.all = false;
                PedidoService.get(
                    function (data){
                        vm.pedidos = data;
                        //console.log(vm.pedidos);
                    }
                );
            }else{

                PedidoVars.all = true;
                PedidoService.get(
                    function (data){
                        vm.pedidos = data;
                        //console.log(vm.pedidos);
                    }
                );
            }
        }



    }


})();