(function () {
    'use strict';

    angular.module('nombreapp.stock.movimientos', ['ngRoute', 'nombreapp.stock.cajas', 'acMovimientos', 'nombreapp.stock.sucursales', 'nombreapp.stock.resultados'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/movimientos', {
                templateUrl: './movimientos/movimientos.html',
                controller: 'MovimientosController'
            });
        }])

        .controller('MovimientosController', MovimientosController);


    MovimientosController.$inject = ['CajasService', '$location', 'MovimientosService', 'SucursalesService', 'ResultadosService'];
    function MovimientosController(CajasService, $location, MovimientosService, SucursalesService, ResultadosService) {

        var vm = this;
        vm.asientos = [];
        vm.filtroMes = filtroMes;
        vm.getDetalles = getDetalles;
        vm.clearDetalles = clearDetalles;
        vm.saldoInicial = 0.0;
        vm.sucursal = {};
        vm.sucursales = [];
        vm.cajas = {};
        vm.caja = [];
        vm.mes = '01';
        vm.mes_hasta = (parseInt(vm.mes) > 8) ? (parseInt(vm.mes) + 1) : '0' + (parseInt(vm.mes) + 1);
        vm.resultados = [];
        vm.resultado_inicial = {};
        vm.resultado_inicial.ca = 0.0;
        vm.resultado_inicial.cc = 0.0;
        vm.resultado_inicial.me = 0.0;
        vm.resultado_inicial.mp = 0.0;
        vm.resultado_inicial.control = 0.0;
        vm.resultado_inicial.general = 0.0;
        vm.resultado_actual = {};
        vm.resultado_actual.ca = 0.0;
        vm.resultado_actual.cc = 0.0;
        vm.resultado_actual.me = 0.0;
        vm.resultado_actual.mp = 0.0;
        vm.resultado_actual.control = 0.0;
        vm.resultado_actual.general = 0.0;
        vm.resultado_posterior = {};
        vm.resultado_posterior.ca = 0.0;
        vm.resultado_posterior.cc = 0.0;
        vm.resultado_posterior.me = 0.0;
        vm.resultado_posterior.mp = 0.0;
        vm.resultado_posterior.control = 0.0;
        vm.resultado_posterior.general = 0.0;



        getResultados();


        function getResultados() {
            ResultadosService.getResultados(function (data) {
                var d = new Date();
                var n = d.getMonth();

                //console.log(n);

                vm.resultados = data;
                for (var i = 0; i < data.length; i++) {
                    var mes = parseInt(data[i].mes) ;
                    if (mes == parseInt(vm.mes)-1) {
                        if (data[i].cuenta_id == '1.1.1.20') {
                            vm.resultado_inicial.control = vm.resultado_actual.control = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.21') {
                            vm.resultado_inicial.ca = vm.resultado_actual.ca = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.22') {
                            vm.resultado_inicial.cc = vm.resultado_actual.cc = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.23') {
                            vm.resultado_inicial.me = vm.resultado_actual.me = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.24') {
                            vm.resultado_inicial.mp = vm.resultado_actual.mp = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.10') {
                            vm.resultado_inicial.general = vm.resultado_actual.general = data[i].total;
                        }

                    }
                }



                for (var i = 0; i < data.length; i++) {
                    var mes = parseInt(data[i].mes);
                    if (mes == parseInt(vm.mes)) {
                        if (data[i].cuenta_id == '1.1.1.20') {
                            vm.resultado_posterior.control = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.21') {
                            vm.resultado_posterior.ca = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.22') {
                            vm.resultado_posterior.cc = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.23') {
                            vm.resultado_posterior.me = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.24') {
                            vm.resultado_posterior.mp = data[i].total;
                        }
                        if (data[i].cuenta_id == '1.1.1.10') {
                            vm.resultado_posterior.general = data[i].total;
                        }

                    }


                }

                //console.log(vm.resultado_actual);
                getDetalles();
            });
        }


        function filtroMes() {
            vm.mes_hasta = (parseInt(vm.mes) > 8) ? (parseInt(vm.mes) + 1) : '0' + (parseInt(vm.mes) + 1);
            clearDetalles();
            getResultados();
        }



        function clearDetalles() {
            vm.asientos = [];
            vm.saldoInicial = 0.0;
            vm.saldoInicial = 0.0;
            vm.sucursal = {};
            vm.sucursales = [];
            vm.resultado_inicial = {};
            vm.resultado_inicial.ca = 0.0;
            vm.resultado_inicial.cc = 0.0;
            vm.resultado_inicial.me = 0.0;
            vm.resultado_inicial.mp = 0.0;
            vm.resultado_inicial.control = 0.0;
            vm.resultado_inicial.general = 0.0;
            vm.resultado_actual = {};
            vm.resultado_actual.ca = 0.0;
            vm.resultado_actual.cc = 0.0;
            vm.resultado_actual.me = 0.0;
            vm.resultado_actual.mp = 0.0;
            vm.resultado_actual.control = 0.0;
            vm.resultado_actual.general = 0.0;
            vm.resultado_posterior = {};
            vm.resultado_posterior.ca = 0.0;
            vm.resultado_posterior.cc = 0.0;
            vm.resultado_posterior.me = 0.0;
            vm.resultado_posterior.mp = 0.0;
            vm.resultado_posterior.control = 0.0;
            vm.resultado_posterior.general = 0.0;
        }

        function getDetalles() {
            //vm.saldoInicial = parseFloat(vm.caja.saldo_inicial);
            //console.log(vm.mes);
            //console.log(vm.mes_hasta);

            //console.log('2015-' + vm.mes + '-01' + ' ' + '2015-' + vm.mes_hasta + '-01');
            CajasService.getMovimientos('2015-' + vm.mes + '-01', '2015-' + vm.mes_hasta + '-01', function (data) {
                //console.log(data);
                var asiento = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].cuenta_id.indexOf('1.1.1.10') > -1) {
                        vm.resultado_actual.general = data[i].general = vm.resultado_actual.general + parseFloat(data[i].importe);
                    }

                    if (data[i].cuenta_id.indexOf('1.1.1.20') > -1) {
                        vm.resultado_actual.control = data[i].control = vm.resultado_actual.control + parseFloat(data[i].importe);
                    }

                    if (data[i].cuenta_id.indexOf('1.1.1.21') > -1) {
                        vm.resultado_actual.ca = data[i].ca = vm.resultado_actual.ca + parseFloat(data[i].importe);
                    }

                    if (data[i].cuenta_id.indexOf('1.1.1.22') > -1) {
                        vm.resultado_actual.cc = data[i].cc = vm.resultado_actual.cc + parseFloat(data[i].importe);
                    }


                    if (data[i].cuenta_id.indexOf('1.1.1.23') > -1) {
                        vm.resultado_actual.me = data[i].me = vm.resultado_actual.me + parseFloat(data[i].importe);
                    }

                    if (data[i].cuenta_id.indexOf('1.1.1.24') > -1) {
                        vm.resultado_actual.mp = data[i].mp = vm.resultado_actual.mp + parseFloat(data[i].importe);
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