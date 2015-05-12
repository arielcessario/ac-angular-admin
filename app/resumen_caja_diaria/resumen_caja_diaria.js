(function () {
    'use strict';

    angular.module('nombreapp.stock.resumenCajaDiaria', ['ngRoute', 'nombreapp.stock.cajas', 'acMovimientos', 'nombreapp.stock.sucursales'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/resumen_caja_diaria', {
                templateUrl: './resumen_caja_diaria/resumen_caja_diaria.html',
                controller: 'ResumenCajaDiariaController'
            });
        }])

        .controller('ResumenCajaDiariaController', ResumenCajaDiariaController);


    ResumenCajaDiariaController.$inject = ['CajasService', '$location', 'MovimientosService', 'SucursalesService'];
    function ResumenCajaDiariaController(CajasService, $location, MovimientosService, SucursalesService) {

        var vm = this;
        vm.asientos = [];
        vm.deleteAsiento = deleteAsiento;
        vm.filtroSucursal = filtroSucursal;
        vm.saldoInicial = 0.0;
        vm.sucursal = {};
        vm.sucursales = [];



        function filtroSucursal() {
            //console.log('entra');
            vm.asientos = [];
            getDetalles();
        }

        function deleteAsiento(id) {
            MovimientosService.deleteAsiento(id, function (data) {
                console.log(data);
            });
        }

        SucursalesService.getSucursales(function (data) {
            vm.sucursales = data;
            vm.sucursal = data[0];
            getDetalles();
        });


        function getDetalles() {
            CajasService.getSaldoInicial(vm.sucursal.sucursal_id, function (data) {

                vm.saldoInicial = parseFloat(data.replace('"', ''));

                CajasService.getCajaDiaria(vm.sucursal.sucursal_id, function (data) {
                    //console.log(data);
                    var asiento = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].cuenta_id.indexOf('1.1.1.') > -1) {
                            vm.saldoInicial += parseFloat(data[i].importe);
                        }


                        if (i > 0 && data[i - 1].asiento_id == data[i].asiento_id) {
                            asiento.push(data[i]);
                        } else {
                            if (asiento.length > 0) {
                                vm.asientos.push(asiento);
                            }
                            asiento = [];
                            asiento.push(data[i]);

                        }
                    }

                    if (asiento.length > 0) {
                        vm.asientos.push(asiento);
                    }

                    //console.log(vm.asientos);
                });
            });
        }


    }


})();