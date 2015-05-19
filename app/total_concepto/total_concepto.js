(function () {
    'use strict';

    angular.module('nombreapp.stock.totalConcepto', ['ngRoute', 'nombreapp.stock.cajas', 'acMovimientos', 'nombreapp.stock.sucursales'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/total_concepto', {
                templateUrl: './total_concepto/total_concepto.html',
                controller: 'TotalConceptoController'
            });
        }])

        .controller('TotalConceptoController', TotalConceptoController);


    TotalConceptoController.$inject = ['CajasService', '$location', 'MovimientosService', 'SucursalesService'];
    function TotalConceptoController(CajasService, $location, MovimientosService, SucursalesService) {

        var vm = this;
        vm.asientos = [];
        vm.filtroSucursal = filtroSucursal;
        vm.getDetalles = getDetalles;
        vm.clearDetalles = clearDetalles;
        vm.saldoInicial = 0.0;
        vm.concepto = '01';
        vm.cajas = {};
        vm.caja = [];
        vm.mes = '01';
        vm.mes_hasta = '';


        function filtroSucursal() {
            CajasService.getCajasBySucursal(vm.sucursal.sucursal_id, function (data) {
                vm.cajas = data;
                vm.caja = data[0];
            })
        }

        SucursalesService.getSucursales(function (data) {
            vm.sucursales = data;
            vm.sucursal = data[0];
            CajasService.getCajasBySucursal(vm.sucursal.sucursal_id, function (data) {
                vm.cajas = data;
                vm.caja = data[0];
            })
        });

        getDetalles();

        function clearDetalles() {
            vm.asientos = [];
            vm.saldoInicial = 0.0;

        }

        function getDetalles() {
            vm.saldoInicial = parseFloat(vm.caja.saldo_inicial);
            var query = '';
            vm.mes_hasta = (parseInt(vm.mes) < 10) ? '0' +  (parseInt(vm.mes) + 1) : (parseInt(vm.mes) + 1) + '';

            switch (vm.concepto){
                case '01':
                    query="(m.cuenta_id = '5.2.1.01' or m.cuenta_id ='5.2.1.02')";
                    break;
                case '02':
                    query='';
                    break;
                case '03':
                    query='';
                    break;
                case '04':
                    query='';
                    break;
                case '05':
                    query='';
                    break;
                case '06':
                    query='';
                    break;
                case '07':
                    query='';
                    break;
                case '08':
                    query='';
                    break;

            }



            console.log(vm.mes_hasta);
            CajasService.totalConcepto(query, '2015-' + vm.mes + '-01', '2015-' + vm.mes_hasta + '-01', function(data){
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
        }
    }


})();