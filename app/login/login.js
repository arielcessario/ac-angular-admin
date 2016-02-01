(function () {
    'use strict';

    angular.module('nombreapp.stock.login', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/login', {
                templateUrl: './login/login.html',
                controller: 'LoginController',
                data: {requiresLogin:false}
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

        SucursalesService.get(function (data) {
            vm.sucursales = data;
            vm.sucursal = vm.sucursales[0];
        });






    }


})();