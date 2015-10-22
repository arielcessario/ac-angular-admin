(function () {

    'use strict';


    angular.module('nombreapp.stock.pagoProveedores', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/pago_proveedores/:id', {
                templateUrl: './pago_proveedores/pago_proveedores.html',
                controller: 'PagoProveedoresController'
            });
        }])

        .controller('PagoProveedoresController', PagoProveedoresController)
        .factory('PagoProveedoresService', PagoProveedoresService)
        .service('PagoProveedoresPedidoService', PagoProveedoresPedidoService);

    PagoProveedoresController.$inject = ["$scope", "$routeParams", "PagoProveedoresService", "$location", "toastr", "MovimientosService",
        'PagoProveedoresPedidoService', 'PedidoService', 'StockService'];
    function PagoProveedoresController($scope, $routeParams, PagoProveedoresService, $location, toastr, MovimientosService,
                                       PagoProveedoresPedidoService, PedidoService, StockService) {
        var vm = this;
        vm.comentario = '';
        vm.subtipo = '00';
        vm.forma_pago = '01';
        vm.save = save;
        vm.id = $routeParams.id;
        vm.pedido = PagoProveedoresPedidoService.pedido;
        vm.pedido.total = parseFloat(vm.pedido.total);


        PedidoService.getByParams('pedido_id', vm.id, 'true', function (data) {

            vm.pedido = data[0];
            vm.pedido.total = parseFloat(vm.pedido.total);
        });


        function save() {
            var detalles = [];
            var detalle = {};
            for (var i = 0; i < vm.pedido.pedidos_detalles.length; i++) {
                detalle = {};
                detalle.producto_id = vm.pedido.pedidos_detalles[i].producto_id;
                detalle.proveedor_id = vm.pedido.proveedor_id;
                detalle.sucursal_id = vm.pedido.sucursal_id;
                detalle.cant_inicial = vm.pedido.pedidos_detalles[i].cantidad;
                detalle.cant_actual = vm.pedido.pedidos_detalles[i].cantidad;
                detalle.precio_unidad = vm.pedido.pedidos_detalles[i].precio_unidad;

                detalles.push(detalle);
            }


            PedidoService.confirmarPedido(vm.pedido,
                function (data) {
                    if (data > 0) {
                        //(sucursal_id, costo, comentario, producto_id, cantidad, proveedor_id, usuario_id)
                        MovimientosService.armarMovimiento('002', vm.subtipo, 1, vm.forma_pago, '', vm.pedido.total, '', vm.comentario, vm.pedido, 0, 1, vm.comentario, function (data) {
                            vm.comentario = '';
                            vm.subtipo = '00';
                            vm.forma_pago = '01';
                            StockService.create(detalles, function (data) {
                                $location.path('/listado_pedidos');
                                toastr.success('Pedido Confirmado');
                            });
                        });
                    } else {
                        //toastr.success('Pedido confirmado con éxito.');
                        $location.path('/listado_pedidos');
                        toastr.error('Error al confirmar el pedido.');
                    }
                });
        }


    }

    PagoProveedoresPedidoService.$inject = ['$http'];
    function PagoProveedoresPedidoService($http) {
        this.pedido = {};

    }

    PagoProveedoresService.$inject = ['$http'];
    function PagoProveedoresService($http) {
        var service = {};
        var url = './stock-api/pagoProveedores.php';
        service.savePagoProveedor = savePagoProveedor;
        service.deletePagoProveedor = deletePagoProveedor;

        return service;


        function savePagoProveedor(pagoProveedore, _function, callback) {

            return $http.post(url,
                {function: _function, pagoProveedore: JSON.stringify(pagoProveedore)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }


        function deletePagoProveedor(id, callback) {
            return $http.post(url,
                {function: 'deletePagoProveedor', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

