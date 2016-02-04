(function () {
    'use strict';

    angular.module('nombreapp.stock.login', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/login', {
                templateUrl: './login/login.html',
                controller: 'LoginController',
                data: {requiresLogin: false}
            });
        }])

        .controller('LoginController', LoginController);


    LoginController.$inject = ['UserService', '$location', 'SucursalesService'];
    function LoginController(UserService, $location, SucursalesService) {
        var vm = this;
        vm.mail = '';
        vm.password = '';
        vm.sucursal = -1;
        vm.sucursales = [];
        vm.pos = [];
        vm.pos_selected = {};
        vm.generarPos = generarPos;

        SucursalesService.get(function (data) {
            vm.sucursales = data;
            vm.sucursal = vm.sucursales[0];
            generarPos();
        });

        function generarPos() {
            vm.pos = [];
            for (var i = 0; i < vm.sucursal.pos_cantidad; i++) {
                vm.pos.push({nombre: 'Caja ' + (i + 1), id: (i + 1)});
            }

            vm.pos_selected = vm.pos[0];
        }


    }


})();