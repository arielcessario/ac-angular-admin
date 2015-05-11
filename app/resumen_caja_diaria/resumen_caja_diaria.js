(function(){
    'use strict';

    angular.module('nombreapp.stock.resumenCajaDiaria', ['ngRoute', 'nombreapp.stock.cajas', 'acMovimientos'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/resumen_caja_diaria', {
                templateUrl: './resumen_caja_diaria/resumen_caja_diaria.html',
                controller: 'ResumenCajaDiariaController'
            });
        }])

        .controller('ResumenCajaDiariaController', ResumenCajaDiariaController);


    ResumenCajaDiariaController.$inject = ['CajasService', '$location', 'MovimientosService'];
    function ResumenCajaDiariaController(CajasService, $location, MovimientosService) {

        var vm = this;
        vm.asientos = [];
        vm.deleteAsiento = deleteAsiento;

        function deleteAsiento(id){
            MovimientosService.deleteAsiento(id, function(data){
                console.log(data);
            });
        }


        CajasService.getCajaDiaria(1, function(data){
            //console.log(data);
            var asiento = [];
            for(var i=0; i<data.length;i++){
                if(i>0 && data[i-1].asiento_id == data[i].asiento_id){
                    asiento.push(data[i]);
                }else{
                    if(asiento.length > 0){
                        vm.asientos.push(asiento);
                    }
                    asiento = [];
                    asiento.push(data[i]);

                }
            }

            if(asiento.length > 0){
                vm.asientos.push(asiento);
            }

            //console.log(vm.asientos);
        });



    }


})();