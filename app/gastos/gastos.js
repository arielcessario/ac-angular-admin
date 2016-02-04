(function () {

    'use strict';


    angular.module('nombreapp.stock.gastos', ['ngRoute', 'toastr', 'acMovimientos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/gastos/:id', {
                templateUrl: './gastos/gastos.html',
                controller: 'GastosController',
                data: {requiresLogin: true}
            });
        }])

        .controller('GastosController', GastosController)
        .service('GastosService', GastosService);

    GastosController.$inject = ["$scope", "$routeParams", "GastosService", "$location", "toastr", "MovimientosService"];
    function GastosController($scope, $routeParams, GastosService, $location, toastr, MovimientosService) {
        var vm = this;
        vm.movimiento = '012';
        vm.comentario = '';
        vm.subtipo = '00';
        vm.forma_pago = '01';
        vm.save = save;
        vm.id = $routeParams.id;

        function save() {
            //tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, cliente_id, usuario_id, comentario, callback
            MovimientosService.armarMovimiento(vm.movimiento, vm.subtipo,  AcUtilsGlobals.sucursal_id, AcUtilsGlobals.pos_id, vm.forma_pago, '', vm.importe, '', vm.comentario, [], 0, 1, vm.comentario, function (data) {
                if (!isNaN(data)) {
                    toastr.success('Gasto generado con éxito');
                    vm.movimiento = '012';
                    vm.comentario = '';
                    vm.subtipo = '00';
                    vm.forma_pago = '01';
                }else{

                    toastr.error('Error al guardar el gasto');
                }
                ;
            });
        }


    }


    GastosService.$inject = ['$http'];
    function GastosService($http) {
        var service = {};
        var url = './stock-api/gastos.php';
        service.getGastos = getGastos;
        service.getGastoByID = getGastoByID;
        service.getGastoByName = getGastoByName;
        service.saveGasto = saveGasto;
        service.deleteGasto = deleteGasto;


        return service;

        function getGastos(callback) {
            return $http.post(url,
                {function: 'getGastos'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {

                });
        }

        function getGastoByID(id, callback) {
            getGastos(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.gasto_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getGastoByName(name, callback) {
            getGastos(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
                });
                callback(response);
            })

        }


        function saveGasto(gasto, _function, callback) {

            return $http.post(url,
                {function: _function, gasto: JSON.stringify(gasto)})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }


        function deleteGasto(id, callback) {
            return $http.post(url,
                {function: 'deleteGasto', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

    }

})();

