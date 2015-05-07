(function () {
    'use strict';

    angular.module('nombreapp.stock.aReponer', ['ngRoute', 'toastr'
        , 'nombreapp.stock.sucursales', 'nombreapp.stock.proveedores', 'appname.stock.pedidos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/a_reponer', {
                templateUrl: './a_reponer/a_reponer.html',
                controller: 'AReponerController'
            });
        }])

        .controller('AReponerController', AReponerController)
        .service('AReponerService', AReponerService);


    AReponerController.$inject = ['$location', 'AReponerService', 'toastr', 'SucursalesService', 'ProveedoresService',
    'PedidosService'];
    function AReponerController($location, AReponerService, toastr, SucursalesService, ProveedoresService, PedidosService) {

        var vm = this;
        vm.productos = [];
        vm.proveedores = [];
        vm.proveedor = [];
        vm.faltantes = [];

        vm.load = load;
        vm.agregarFaltante = agregarFaltante;
        vm.nuevoPedido = nuevoPedido;

        function nuevoPedido(){

            vm.pedido = {
                proveedor_id: vm.proveedor.proveedor_id,
                usuario_id: 1,
                fecha_pedido: '',
                fecha_entrega: '',
                total: 0,
                iva: 0,
                sucursal_id: 1,
                detalles: []
            };

            for(var i = 0; i<vm.faltantes.length; i++){
                vm.detalle = {};
                vm.detalle = {
                    pedido_id: 0,
                    producto_id: vm.faltantes[i].producto_id,
                    producto_nombre: '',
                    cantidad: 0,
                    precio_unidad: 0,
                    precio_total: 0
                };

                vm.pedido.detalles.push(vm.detalle);
            }

            //console.log(vm.pedido);


            PedidosService.savePedido('savePedido', vm.pedido,
                function (data) {

                    if (data.status > 0) {
                        toastr.success('Pedido generado con éxito.');
                        $location.path('/pedidos/'+data.results);
                    } else {
                        toastr.success('Error al generar el pedido.');
                    }
                });
        }

        function agregarFaltante(producto){
            var encontrado = false;
            var index = -1;
            for (var i = 0; i<vm.faltantes.length; i++){
                if(vm.faltantes[i] === producto){
                    encontrado = true;
                    index = i;
                }
            }

            if(encontrado){
                vm.faltantes.splice(index,1);
            }else{
                vm.faltantes.push(producto);
            }

            //console.log(vm.faltantes);
        }


        ProveedoresService.getProveedores(function (data) {
            vm.proveedores = data;
            vm.proveedor = data[0];
            load();
        });


        function load() {
            AReponerService.getAReponerByProv(vm.proveedor.proveedor_id, function (data) {
                vm.productos = data;
            });

        }


    }

    AReponerService.$inject = ['$http'];
    function AReponerService($http) {
        var url = './stock-api/stock.php';
        var service = {};


        service.getAReponer = getAReponer;
        service.getAReponerByProv = getAReponerByProv;

        return service;

        function getAReponer(callback) {
            $http.post(url,
                {function: 'aReponer'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function getAReponerByProv(proveedor_id, callback) {

            getAReponer(function (data) {
                var response = data.filter(function (elem, index, array) {
                    //var lista = [];

                    for (var i = 0; i < elem.proveedores.length; i++) {

                        if (elem.proveedores[i].proveedor_id === proveedor_id) {
                            return elem;

                        }
                    }

                    //console.log(lista);
                    //return lista;
                });

                callback(response);
            });
        }


    }

})();