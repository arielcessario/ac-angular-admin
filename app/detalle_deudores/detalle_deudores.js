(function(){
    'use strict';

    angular.module('nombreapp.stock.detalleDeudores', ['ngRoute', 'nombreapp.stock.clientes',
        'acAngularLoginClient'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/detalle_deudores/:id', {
                templateUrl: './detalle_deudores/detalle_deudores.html',
                controller: 'DetalleDeudoresController'
            });
        }])

        .controller('DetalleDeudoresController', DetalleDeudoresController);


    DetalleDeudoresController.$inject = ['acAngularLoginClientService','ClientesService', '$location', '$routeParams'];
    function DetalleDeudoresController(acAngularLoginClientService, ClientesService, $location, $routeParams) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.cancelarDeuda = cancelarDeuda;
        vm.detalles = [];
        vm.id = $routeParams.id;
        vm.cliente = {};

        ClientesService.getDeudorById(vm.id, function(data){
            vm.cliente = data;

        });

        function cancelarDeuda(){
            $location.path("/cancelar_deuda/"+vm.id);
        }

    }


})();