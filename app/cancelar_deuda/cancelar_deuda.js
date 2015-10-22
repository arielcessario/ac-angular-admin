(function () {

    'use strict';


    angular.module('nombreapp.stock.cancelarDeuda', ['ngRoute', 'toastr', 'acMovimientos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/cancelar_deuda/:id', {
                templateUrl: './cancelar_deuda/cancelar_deuda.html',
                controller: 'CancelaDeudaController'
            });
        }])

        .controller('CancelaDeudaController', CancelaDeudaController)
        .service('CancelaDeudaPedidoService', CancelaDeudaPedidoService);

    CancelaDeudaController.$inject = ["$scope", "$routeParams", "$location", "toastr", "MovimientosService",
        'CancelaDeudaPedidoService', 'UserService'];
    function CancelaDeudaController($scope, $routeParams, $location, toastr, MovimientosService,
                                       CancelaDeudaPedidoService, UserService) {
        var vm = this;
        vm.comentario = '';
        vm.subtipo = '00';
        vm.forma_pago = '01';
        vm.save = save;
        vm.id = $routeParams.id;
        vm.pedido = CancelaDeudaPedidoService.pedido;
        vm.pedido.total = parseFloat(vm.pedido.total);
        vm.cliente = {};


        UserService.getDeudorById(vm.id, function (data) {
            data.saldo = parseFloat(data.saldo )*-1;
            vm.cliente = data;

        });

        function save() {
            //sucursal_id, pagando * total, cliente_id, comentario, usuario_id
            //(tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, cliente_id, usuario_id, comentario, callback)
            vm.comentario = "Cancelación de deuda " + vm.comentario;

            MovimientosService.armarMovimiento('015', vm.subtipo, 1, vm.forma_pago, '', vm.cliente.saldo, '', vm.comentario, '', vm.id, 1, vm.comentario, function (data) {

                UserService.actualizarSaldo(vm.cliente.cliente_id, parseFloat(vm.cliente.saldo), function(data){
                    console.log(data);
                    if(data){
                        vm.comentario = '';
                        vm.subtipo = '00';
                        vm.forma_pago = '01';
                        $location.path('/listado_deudores');
                        toastr.success('Saldo Actualizado');
                    }

                });



            });


        }


    }

    CancelaDeudaPedidoService.$inject = ['$http'];
    function CancelaDeudaPedidoService($http) {
        this.pedido = {};

    }


})();

