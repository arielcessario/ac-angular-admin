(function(){
    'use strict';

    angular.module('nombreapp.stock.detalleDeudores', ['ngRoute'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/detalle_deudores/:id', {
                templateUrl: './detalle_deudores/detalle_deudores.html',
                controller: 'DetalleDeudoresController'
            });
        }])

        .controller('DetalleDeudoresController', DetalleDeudoresController);


    DetalleDeudoresController.$inject = ['UserService', '$location', '$routeParams'];
    function DetalleDeudoresController(UserService, $location, $routeParams) {


        var vm = this;

        vm.cancelarDeuda = cancelarDeuda;
        vm.detalles = [];
        vm.id = $routeParams.id;
        vm.cliente = {};

        UserService.getDeudorById(vm.id, function(data){
            vm.cliente = data;

        });

        function cancelarDeuda(){
            $location.path("/cancelar_deuda/"+vm.id);
        }

    }


})();