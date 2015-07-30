(function () {

    'use strict';


    angular.module('nombreapp.stock.pagoProveedores', ['ngRoute', 'toastr', 'acMovimientos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/pago_proveedores', {
                templateUrl: './pago_proveedores/pago_proveedores.html',
                controller: 'PagoProveedoresController'
            });
        }])

        .controller('PagoProveedoresController', PagoProveedoresController)
        .factory('PagoProveedoresService', PagoProveedoresService)
        .service('PagoProveedoresPedidoService', PagoProveedoresPedidoService);

    PagoProveedoresController.$inject = ["$scope", "$routeParams", "PagoProveedoresService", "$location", "toastr", "MovimientosService",
        'PagoProveedoresPedidoService', 'PedidosService'];
    function PagoProveedoresController($scope, $routeParams, PagoProveedoresService, $location, toastr, MovimientosService,
                                       PagoProveedoresPedidoService, PedidosService) {
        var vm = this;
        vm.comentario = '';
        vm.subtipo = '00';
        vm.forma_pago = '01';
        vm.save = save;
        vm.id = $routeParams.id;
        vm.pedido = PagoProveedoresPedidoService.pedido;
        vm.pedido.total = parseFloat(vm.pedido.total);
        console.log(vm.pedido);


        function save() {
            PedidosService.confirmarPedido('confirmarPedido', PagoProveedoresPedidoService.pedido,
                function (data) {
                    //console.log(data);
                    if (data.status > 0) {
                        //(sucursal_id, costo, comentario, producto_id, cantidad, proveedor_id, usuario_id)
                        MovimientosService.armarMovimiento('002', vm.subtipo, 1, vm.forma_pago, '', vm.pedido.total, '', vm.comentario, vm.pedido, 0, 1, vm.comentario, function(data){
                            console.log(data);
                            vm.comentario = '';
                            vm.subtipo = '00';
                            vm.forma_pago = '01';
                            $location.path('/listado_pedidos');
                            toastr.success('Pedido Confirmado');
                        } );




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

