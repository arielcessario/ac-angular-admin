(function(){
    'use strict';

    angular.module('nombreapp.stock.listadoPedidos', ['ngRoute', 'appname.stock.pedidos'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/listado_pedidos', {
                templateUrl: './listado_pedidos/listado_pedidos.html',
                controller: 'ListadoPedidosController'
            });
        }])

        .controller('ListadoPedidosController', ListadoPedidosController);


    ListadoPedidosController.$inject = ['PedidosService', '$location'];
    function ListadoPedidosController(PedidosService, $location) {

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

                PedidosService.getPedidosActivos(-1,
                    function (data){
                        //console.log(data);
                        vm.pedidos = data;
                        //console.log(vm.pedidos);
                    }
                );
            }else{

                PedidosService.getPedidos(
                    function (data){
                        //console.log(data);
                        vm.pedidos = data;
                        //console.log(vm.pedidos);
                    }
                );
            }
        }



    }


})();