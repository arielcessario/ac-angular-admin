(function(){
    'use strict';

    angular.module('nombreapp.stock.listadoDeudores', ['ngRoute'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/listado_deudores', {
                templateUrl: './listado_deudores/listado_deudores.html',
                controller: 'ListadoDeudoresController'
            });
        }])

        .controller('ListadoDeudoresController', ListadoDeudoresController);


    ListadoDeudoresController.$inject = ['UserService', '$location'];
    function ListadoDeudoresController(UserService, $location) {


        var vm = this;

        vm.deudores = [];
        vm.detalle = detalle;
        vm.mostrarDetalle = [];
        vm.cancelarDeuda = cancelarDeuda;

        function cancelarDeuda(){
            $location.path("/cancelar_deuda/"+vm.id);
        }

        function detalle(id){
            $location.path('/detalle_deudores/'+id);
        }

        UserService.getDeudores(
            function (data){
                console.log(data);
                vm.deudores = data;
                //console.log(vm.deudores);
            }
        );

    }


})();