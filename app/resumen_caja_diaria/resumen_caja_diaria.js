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


    ResumenCajaDiariaController.$inject = ['CajasService', '$location', 'MovimientosService',
        'SucursalesService', '$timeout', '$interval'];
    function ResumenCajaDiariaController(CajasService, $location, MovimientosService,
                                         SucursalesService, $timeout, $interval) {

        var vm = this;
        vm.asientos = [];
        vm.deleteAsiento = deleteAsiento;
        vm.filtroSucursal = filtroSucursal;
        vm.modificarAsiento = modificarAsiento;
        vm.saldoInicial = 0.0;
        vm.sucursal = {};
        vm.sucursales = [];
        vm.sucursal_id = 1;


        function modificarAsiento(asiento_id){
            $location.path('/cajas/'+asiento_id);
        }


        function filtroSucursal() {
            //console.log('entra');
            vm.asientos = [];
            getDetalles();
        }

        function deleteAsiento(id) {

            var r = confirm('Realmente desea eliminar el movimiento?');

            if(!r){
                return;
            }
            MovimientosService.deleteAsiento(id,vm.sucursal_id, function (data) {
                //console.log(data);
                vm.asientos = [];
                getDetalles();
            });
        }

        SucursalesService.getSucursales(function (data) {
            vm.sucursales = data;
            vm.sucursal = data[0];
            getDetalles();
        });


        function getDetalles() {
            CajasService.getSaldoInicial(vm.sucursal.sucursal_id, function (data) {

                //console.log(data);
                vm.saldoInicial = parseFloat(data.replace('"', ''));

                CajasService.getCajaDiaria(vm.sucursal.sucursal_id, function (data) {
                    console.log(data);
                    var asiento = [];
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].cuenta_id.indexOf('1.1.1.0') > -1) {
                            vm.saldoInicial += parseFloat(data[i].importe);
                        }


                        if (i > 0 && data[i - 1].asiento_id == data[i].asiento_id) {
                            asiento.push(data[i]);
                        } else {
                            if (asiento.length > 0) {
                                vm.asientos.push({asiento: asiento});
                                asiento.sort(function(a,b){
                                    return b.movimiento_id - a.movimiento_id;
                                });
                            }
                            asiento = [];
                            asiento.push(data[i]);

                        }
                    }


                    if (asiento.length > 0) {
                        vm.asientos.push({asiento: asiento});
                        asiento.sort(function(a,b){
                            return b.movimiento_id - a.movimiento_id;
                        });

                    }


                    //console.log(vm.asientos);

                    var detalle_caja = {
                        asiento_id: '',
                        movimiento_id: '',
                        cuenta_id: '',
                        description: '',
                        valor: ''
                    };
                    var detalles_caja = [];

                    for (var i = 0; i < vm.asientos.length; i++) {
                        for (var x = vm.asientos[i].asiento.length - 1; x > -1; x--) {


                            //Agrega el total de lo que ingresó a la caja
                            if (vm.asientos[i].asiento[x].cuenta_id.indexOf('1.1.1.0') > -1) {
                                detalle_caja.asiento_id = vm.asientos[i].asiento[x].asiento_id;
                                detalle_caja.movimiento_id = vm.asientos[i].asiento[x].movimiento_id;
                                detalle_caja.cuenta_id = vm.asientos[i].asiento[x].cuenta_id;
                                detalle_caja.description = vm.asientos[i].asiento[x].detalles[0].detalle + ' ' +
                                    vm.asientos[i].asiento[x].fecha;
                                detalle_caja.valor = vm.asientos[i].asiento[x].importe;
                                //console.log(vm.asientos[i].asiento[x]);
                                detalles_caja.push(detalle_caja);
                            }

                            //Agrega un mensaje diciendo que la venta fue de mercado pago y se contabiliza a cuentas
                            if (vm.asientos[i].asiento[x].cuenta_id.indexOf("1.1.1.24") > -1
                                || vm.asientos[i].asiento[x].cuenta_id.indexOf('1.1.2.') > -1) {

                                var descrExtra = (vm.asientos[i].asiento[x].cuenta_id.indexOf("1.1.1.24") > -1)?
                                ' Verificar ingreso en Movimientos':
                                ' Verificar ingreso a Deudores';

                                detalle_caja.asiento_id = vm.asientos[i].asiento[x].asiento_id;
                                detalle_caja.movimiento_id = vm.asientos[i].asiento[x].movimiento_id;
                                detalle_caja.cuenta_id = vm.asientos[i].asiento[x].cuenta_id;
                                detalle_caja.description = vm.asientos[i].asiento[x].detalles[0].detalle + ' ' +
                                    vm.asientos[i].asiento[x].fecha + descrExtra ;
                                //detalle_caja.valor = vm.asientos[i].asiento[x].importe;
                                //console.log(vm.asientos[i].asiento[x]);
                                detalles_caja.push(detalle_caja);
                            }


                            //Da el detalle de la venta que se realizó
                            if (vm.asientos[i].asiento[x].cuenta_id.indexOf('4.1.1.01') > -1) {
                                detalle_caja.asiento_id = vm.asientos[i].asiento[x].asiento_id;

                                detalle_caja.asiento_id = vm.asientos[i].asiento[x].asiento_id;
                                detalle_caja.movimiento_id = vm.asientos[i].asiento[x].movimiento_id;
                                detalle_caja.cuenta_id = vm.asientos[i].asiento[x].cuenta_id;
                                detalle_caja.description = vm.asientos[i].asiento[x].detalles[3].detalle.split(' - ')[1];
                                detalle_caja.valor = vm.asientos[i].asiento[x].detalles[2].detalle + ' x ' +
                                    vm.asientos[i].asiento[x].detalles[1].detalle + ' = $' +
                                    (parseFloat(vm.asientos[i].asiento[x].detalles[2].detalle) *
                                    parseFloat(vm.asientos[i].asiento[x].detalles[1].detalle));
                                //console.log(vm.asientos[i].asiento[x]);
                                detalles_caja.push(detalle_caja);
                            }

                            //Si es compra de mercaderías
                            if (vm.asientos[i].asiento[x].cuenta_id.indexOf('1.1.7.01') > -1 &&
                                parseFloat(vm.asientos[i].asiento[x].importe) > 0) {
                                detalle_caja.asiento_id = vm.asientos[i].asiento[x].asiento_id;

                                detalle_caja.asiento_id = vm.asientos[i].asiento[x].asiento_id;
                                detalle_caja.movimiento_id = vm.asientos[i].asiento[x].movimiento_id;
                                detalle_caja.cuenta_id = vm.asientos[i].asiento[x].cuenta_id;
                                detalle_caja.description = vm.asientos[i].asiento[x].detalles[3].detalle.split(' - ')[1];
                                detalle_caja.valor = vm.asientos[i].asiento[x].detalles[2].detalle + ' x ' +
                                    vm.asientos[i].asiento[x].detalles[1].detalle + ' = $' +
                                    (parseFloat(vm.asientos[i].asiento[x].detalles[2].detalle) *
                                    parseFloat(vm.asientos[i].asiento[x].detalles[1].detalle));
                                //console.log(vm.asientos[i].asiento[x]);
                                detalles_caja.push(detalle_caja);
                            }

                            detalle_caja = {};

                        }
                    }
                    //console.log(detalles_caja);
                    //vm.gridOptions.data = vm.asientos;
                    vm.asientos = detalles_caja;
                    //console.log(detalles_caja);
                    //console.log(vm.asientos);


                });
            });
        }


    }


})
();