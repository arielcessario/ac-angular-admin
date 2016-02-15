(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('' +
            'nombreapp.stock.abrirCerrarCaja', ['ngRoute', 'toastr'
            , 'acMovimientos', 'nombreapp.stock.cajas'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/abrir_cerrar_caja', {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: 'AbrirCerrarCajaController',
                data: {requiresLogin: true}
            });
        }])
        .controller('AbrirCerrarCajaController', AbrirCerrarCajaController);


    AbrirCerrarCajaController.$inject = ['$routeParams', 'CajasService', 'toastr', '$location', '$window', 'AcUtilsGlobals'];
    function AbrirCerrarCajaController($routeParams, CajasService, toastr, $location, $window, AcUtilsGlobals) {

        var vm = this;
        vm.isOpen = true;
        vm.saldoInicial = 0.0;
        vm.saldoFinal = 0.0;
        vm.saldoFinalReal = 0.0;
        vm.detalles = '';


        vm.save = save;

        CajasService.checkEstado(AcUtilsGlobals.sucursal_id, AcUtilsGlobals.pos_id, function (data) {
            //console.log(data);

            if (data.asiento_cierre_id == null || data.asiento_cierre_id == 0) {
                vm.isOpen = true;
                vm.saldoInicial = data.saldo_inicial;
                CajasService.getSaldoFinal(1, function (data) {
                    vm.saldoFinal = parseFloat(data[0].total) + parseFloat(vm.saldoInicial);
                    vm.saldoFinalReal = parseFloat(data[0].total) + parseFloat(vm.saldoInicial);
                });
            } else {
                vm.isOpen = false;
                CajasService.getSaldoFinalAnterior(AcUtilsGlobals.sucursal_id, AcUtilsGlobals.pos_id, function (data) {
                    vm.saldoInicial = data[0].valor_real;
                    vm.detalles = data[0].detalles;
                });
            }
        });

        function save() {
            if (vm.isOpen) {
                CajasService.cerrarCaja(AcUtilsGlobals.sucursal_id, AcUtilsGlobals.pos_id, vm.saldoFinalReal, vm.detalles, function (data) {
                    $location.path('/resumen_caja_diaria');
                })
            } else {
                CajasService.abrirCaja(AcUtilsGlobals.sucursal_id, AcUtilsGlobals.pos_id, vm.saldoInicial, function (data) {
                    $location.path('/resumen_caja_diaria');
                })

            }
        }


    }


})();