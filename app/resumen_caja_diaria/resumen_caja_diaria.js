(function () {
    'use strict';

    angular.module('nombreapp.stock.resumenCajaDiaria', ['ngRoute', 'nombreapp.stock.cajas', 'acMovimientos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/resumen_caja_diaria', {
                templateUrl: './resumen_caja_diaria/resumen_caja_diaria.html',
                controller: 'ResumenCajaDiariaController'
            });
        }])

        .controller('ResumenCajaDiariaController', ResumenCajaDiariaController);


    ResumenCajaDiariaController.$inject = ['CajasService', '$location', 'MovimientosService',
        'SucursalesService', '$timeout', '$interval', 'AcUtilsGlobals', '$rootScope'];
    function ResumenCajaDiariaController(CajasService, $location, MovimientosService,
                                         SucursalesService, $timeout, $interval, AcUtilsGlobals, $rootScope) {

        var vm = this;
        vm.asientos = [];
        vm.deleteAsiento = deleteAsiento;
        vm.filtroSucursal = filtroSucursal;
        vm.modificarAsiento = modificarAsiento;
        vm.saldoInicial = 0.0;
        vm.saldoFinal = 0.0;
        vm.sucursal = {};
        vm.sucursales = [];
        vm.sucursal_id = 1;


        function modificarAsiento(asiento_id) {
            $location.path('/cajas/' + asiento_id);
        }


        function filtroSucursal() {
            //console.log('entra');
            vm.asientos = [];
            getDetalles();
        }

        function deleteAsiento(id) {

            var r = confirm('Realmente desea eliminar el movimiento?');

            if (!r) {
                return;
            }
            MovimientosService.deleteAsiento(id, vm.sucursal_id, function (data) {
                //console.log(data);
                vm.asientos = [];
                getDetalles();
            });
        }

        SucursalesService.get(function (data) {
            console.log(data);
            vm.sucursales = data;
            vm.sucursal = data[0];
            getDetalles();
        });


        function getDetalles() {
            AcUtilsGlobals.isWaiting = true;
            $rootScope.$broadcast('IsWaiting');


            CajasService.getSaldoInicial(vm.sucursal.sucursal_id, function (data) {

                vm.saldoInicial = parseFloat(data.replace('"', ''));
                vm.saldoFinal = vm.saldoInicial;

                CajasService.getCajaDiaria(vm.sucursal.sucursal_id, function (data) {

                    var asientos = [];
                    var detalles = [];
                    var asiento = {};

                    for (var i = 0; i < data.length; i++) {

                        for (var x = 0; x < data[i].movimientos.length; x++) {

                            //agrego el movimiento de caja

                            if (data[i].movimientos[x].cuenta_id.indexOf('1.1.1.0') > -1 || // Caja chica
                                data[i].movimientos[x].cuenta_id.indexOf('1.1.2.0') > -1 || // Deudores
                                data[i].movimientos[x].cuenta_id.indexOf('1.1.4.0') > -1 || // Tarjeta
                                data[i].movimientos[x].cuenta_id.indexOf('1.1.1.2') > -1    // CC CA MP ML
                            ) {

                                for (var y = 0; y < data[i].movimientos[x].detalles.length; y++) {
                                    if (data[i].movimientos[x].detalles[y].detalle_tipo_id == '2') {
                                        asiento.detalle = data[i].movimientos[x].detalles[y].texto;
                                    }
                                }

                                if (data[i].movimientos[x].cuenta_id.indexOf('1.1.1.0') > -1) {
                                    vm.saldoFinal += parseFloat(data[i].movimientos[x].importe);
                                    asiento.valor = data[i].movimientos[x].importe;
                                } else {
                                    asiento.valor = '---';
                                }

                                asiento.total = true;
                                detalles.push(asiento);
                                asiento = {};
                            }

                            // Agrego el detalle de los movimientos

                            if ((data[i].movimientos[x].cuenta_id.indexOf('1.1.7.0') > -1 && data[i].movimientos[x].importe > 0) || // Compra de mercaderías
                                data[i].movimientos[x].cuenta_id.indexOf('4.1.1.0') > -1) {  // Venta de Productos y/o Servicios
                                for (var y = 0; y < data[i].movimientos[x].detalles.length; y++) {

                                    if (data[i].movimientos[x].detalles[y].detalle_tipo_id == '2') {
                                        var cat = (asiento.detalle != undefined) ? asiento.detalle : '';
                                        asiento.detalle = data[i].movimientos[x].detalles[y].texto + ' ' + cat;
                                    }

                                    if (data[i].movimientos[x].detalles[y].detalle_tipo_id == '8') {
                                        var cat = (asiento.detalle != undefined) ? asiento.detalle : '';
                                        asiento.detalle = cat + ' ' + data[i].movimientos[x].detalles[y].texto;
                                    }

                                    //asiento.valor = data[i].movimientos[x].importe;
                                    if (data[i].movimientos[x].detalles[y].detalle_tipo_id == '13') {
                                        asiento.valor = data[i].movimientos[x].detalles[y].texto + ' x ' + data[i].movimientos[x].importe;
                                    }
                                }
                                detalles.unshift(asiento);
                                asiento = {};

                            }


                        }

                        if (detalles.length > 0) {
                            for(var index = 0; index < detalles.length; index ++){

                                asientos.push(detalles[index]);
                            }
                            detalles = [];
                        }


                    }

                    vm.asientos = asientos;

                    AcUtilsGlobals.isWaiting = false;
                    $rootScope.$broadcast('IsWaiting');


                });
            });
        }


    }


})
();