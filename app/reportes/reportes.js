(function () {

    'use strict';


    angular.module('nombreapp.stock.reportes', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/reportes/:id', {
                templateUrl: './reportes/reportes.html',
                controller: 'ReportesController',
                data: {requiresLogin: true}
            });
        }])

        .controller('ReportesController', ReportesController)
        .factory('ReportesService', ReportesService)
    ;

    ReportesController.$inject = ['$timeout', 'ReportesService'];
    function ReportesController($timeout, ReportesService) {
        var vm = this;

        vm.reporte = 'reportes/lstMargenes.html';
        vm.hasta = new Date();
        vm.desde = new Date();
        vm.desde.setDate(vm.desde.getDate() - 30);
        vm.datos = [];
        vm._datos = [];


        vm.values = [];

        // Funciones
        vm.verReporte = verReporte;
        vm.generar = generar;


        function verReporte(reporte) {
            vm.datos = [];
            vm.reporte = reporte;
        }

        function generar() {
            vm.datos = [];
            switch (vm.reporte) {
                case 'reportes/lstMargenes.html':
                    //google.charts.setOnLoadCallback(drawMargenes);
                    drawMargenes();
                    break;
                case 'reportes/lstTotalesPorCuenta.html':
                    //google.charts.setOnLoadCallback(drawMargenes);
                    drawTotalesPorCuenta();
                    break;
            }
        }

        function drawTotalesPorCuenta() {
            ReportesService.getTotalesPorCuenta(vm.desde, vm.hasta, function (data) {
                var ordenado = [];
                for (var i = 0; i < data.length; i++) {
                    var index = {};

                    index = ordenado.find(function (elem, idx, array) {

                        if (data[i].cuenta_id == elem.cuenta_id) {
                            return elem;
                        }
                    });


                    if (ordenado.indexOf(index) > -1) {
                        if (data[i].importe > 0) {
                            ordenado[ordenado.indexOf(index)].haber = data[i].importe;
                        } else {
                            ordenado[ordenado.indexOf(index)].debe = data[i].importe;
                        }
                    } else {
                        if (data[i].importe > 0) {
                            ordenado.push({
                                descr: data[i].descripcion,
                                cuenta_id: data[i].cuenta_id,
                                debe: 0,
                                haber: data[i].importe,
                                total: 0
                            });
                        } else {
                            ordenado.push({
                                descr: data[i].descripcion,
                                cuenta_id: data[i].cuenta_id,
                                debe: data[i].importe,
                                haber: 0,
                                total: 0
                            })
                        }
                    }
                }


                for (var i = 0; i < ordenado.length; i++) {
                    ordenado[i].total = parseFloat(ordenado[i].debe) + parseFloat(ordenado[i].haber);
                }
                vm.datos = ordenado;
            });
        }


        function drawMargenes() {
            ReportesService.getMargenes(vm.desde, vm.hasta, function (data) {

                var res = {'producto': '', 'cantidad': 0, 'costo': 0, 'vendido': 0, 'margen': 0};
                for (var i = 0; i < data.length; i = i + 2) {
                    res = {'producto': '', 'cantidad': 0, 'costo': 0, 'vendido': 0, 'margen': 0};

                    res.producto = data[i].producto;
                    res.cantidad = data[i].cantidad;

                    if (data[i].cuenta_id == '4.1.1.01') {
                        res.vendido = data[i].importe / data[i].cantidad;
                    } else {
                        res.costo = data[i].importe / data[i].cantidad;
                    }
                    if (data[i + 1].cuenta_id == '5.1.1.01') {
                        res.costo = data[i + 1].importe / data[i].cantidad;
                    } else {
                        res.vendido = data[i + 1].importe / data[i].cantidad;
                    }

                    res.margen = res.vendido - res.costo;
                    vm.datos.push(res);

                }


                vm.datos.sort(function (a, b) {
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return b.margen - a.margen;
                });

                var values = [];
                for (var i = 0; i < vm.datos.length; i++) {
                    values.push([vm.datos[i].producto, vm.datos[i].margen]);
                }

                // Define the chart to be drawn.
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Producto');
                data.addColumn('number', 'Margen');
                data.addRows(values);

                // Instantiate and draw the chart.
                var chart = new google.charts.Bar(document.getElementById('graphMargenes'));
                //var chart = new google.visualization.BarChart(document.getElementById('graphMargenes'));
                //var chart = new google.visualization.PieChart(document.getElementById('graphMargenes'));


                //angular.element(document).ready(chart.draw(data, null));
                //$timeout(chart.draw(data, null), 100);
                chart.draw(data, null);


            });


        }
    }

    ReportesService.$inject = ['$http'];
    function ReportesService($http) {
        var vm = this;
        var service = {};
        var url = 'stock-api/reportes.php';

        service.getMargenes = getMargenes;
        service.getTotalesPorCuenta = getTotalesPorCuenta;

        return service;

        function getMargenes(desde, hasta, callback) {

            var _desde = desde.getFullYear() + '-' + (desde.getMonth() + 1) + '-' + desde.getDate();
            var _hasta = hasta.getFullYear() + '-' + (hasta.getMonth() + 1) + '-' + hasta.getDate();

            $http.get(url + '?function=getMargenes&desde=' + _desde + '&hasta=' + _hasta)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });

        }

        function getTotalesPorCuenta(desde, hasta, callback) {

            var _desde = desde.getFullYear() + '-' + (desde.getMonth() + 1) + '-' + desde.getDate();
            var _hasta = hasta.getFullYear() + '-' + (hasta.getMonth() + 1) + '-' + hasta.getDate();

            $http.get(url + '?function=getTotalesPorCuenta&desde=' + _desde + '&hasta=' + _hasta)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });

        }
    }

})();
