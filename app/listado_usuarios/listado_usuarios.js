(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoUsuarios', ['ngRoute', 'nombreapp.stock.usuarios',
        'acAngularLoginClient'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_usuarios', {
                templateUrl: './listado_usuarios/listado_usuarios.html',
                controller: 'ListadoUsuariosController'
            });
        }])

        .controller('ListadoUsuariosController', ListadoUsuariosController);


    ListadoUsuariosController.$inject = ['acAngularLoginClientService', 'UserService', '$location', 'AcUtilsGlobals', '$rootScope'];
    function ListadoUsuariosController(acAngularLoginClientService, UserService, $location, AcUtilsGlobals, $rootScope) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.usuarios = [];
        vm.detalle = detalle;

        function detalle(id) {
            $location.path('/usuarios/' + id);
        }

        AcUtilsGlobals.isWaiting = true;
        $rootScope.$broadcast('IsWaiting');
        UserService.get(
            function (data) {
                //console.log(data);
                vm.usuarios = data;
                //console.log(vm.usuarios);
                AcUtilsGlobals.isWaiting = false;
                $rootScope.$broadcast('IsWaiting');
            }
        )
        ;

    }

    ListadoUsuariosService.$inject = ['$http'];
    function ListadoUsuariosService($http) {
        var service = {};

        return service;

    }

})();