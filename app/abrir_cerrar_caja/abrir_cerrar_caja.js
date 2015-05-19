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
                controller: 'AbrirCerrarCajaController'
            });
        }])
        .controller('AbrirCerrarCajaController', AbrirCerrarCajaController);


    AbrirCerrarCajaController.$inject = ['$routeParams', 'CajasService', 'toastr', '$location', '$window'];
    function AbrirCerrarCajaController($routeParams, CajasService, toastr, $location, $window) {

        var vm = this;
        vm.isOpen = true;
        vm.saldoInicial = 0.0;
        vm.saldoFinal = 0.0;
        vm.saldoFinalReal = 0.0;


        vm.save = save;

        CajasService.checkEstado(1, function (data) {
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
                CajasService.getSaldoFinalAnterior(1, function(data){
                    vm.saldoInicial = data[0].valor_real;
                });
            }
        });

        function save(){
            if(vm.isOpen){
                CajasService.cerrarCaja(1, vm.saldoFinalReal, function(data){
                    console.log(data);
                    $location.path('/resumen_caja_diaria');
                })
            }else{
                CajasService.abrirCaja(1, vm.saldoInicial, function(data){
                    console.log(data);
                    $location.path('/resumen_caja_diaria');
                })

            }
        }


    }


})();