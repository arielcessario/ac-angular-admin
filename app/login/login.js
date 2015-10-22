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


    LoginController.$inject = ['UserService', '$location'];
    function LoginController(UserService, $location) {
        var vm = this;
        vm.mail = '';
        vm.password = '';
        vm.sucursal = -1;

        vm.login = function(){
            UserService.login(vm.mail, vm.password, vm.sucursal, function (data) {
                if (data != -1) {
                    $location.path('/');
                }
            });
        };


    }


})();