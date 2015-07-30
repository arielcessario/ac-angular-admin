(function(){
    'use strict';

    angular.module('nombreapp.stock.listadoDeudores', ['ngRoute', 'nombreapp.stock.clientes',
        'acAngularLoginClient'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/listado_deudores', {
                templateUrl: './listado_deudores/listado_deudores.html',
                controller: 'ListadoDeudoresController'
            });
        }])

        .controller('ListadoDeudoresController', ListadoDeudoresController);


    ListadoDeudoresController.$inject = ['acAngularLoginClientService','ClientesService', '$location'];
    function ListadoDeudoresController(acAngularLoginClientService, ClientesService, $location) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.deudores = [];
        vm.detalle = detalle;
        vm.mostrarDetalle = [];

        function detalle(id){
            $location.path('/deudores/'+id);
        }

        ClientesService.getDeudores(
            function (data){
                console.log(data);
                vm.deudores = data;
                //console.log(vm.deudores);
            }
        );

    }


})();