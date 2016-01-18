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


    ListadoUsuariosController.$inject = ['acAngularLoginClientService', 'UserService', '$location', 'AcUtilsGlobals',
        '$rootScope', 'UserVars'];
    function ListadoUsuariosController(acAngularLoginClientService, UserService, $location, AcUtilsGlobals,
                                       $rootScope, UserVars) {

        acAngularLoginClientService.checkCookie();

        var vm = this;

        vm.usuarios = [];
        vm.detalle = detalle;


        // Implementaci�n de la paginaci�n
        vm.start = 0;
        vm.end = UserVars.paginacion;
        vm.pagina = UserVars.pagina;
        vm.paginas = UserVars.paginas;
        vm.next = function () {
            vm.start = UserService.next().start;
            vm.pagina = UserVars.pagina;
        };
        vm.prev = function () {
            vm.start = UserService.prev().start;
            vm.pagina = UserVars.pagina;
        };
        vm.goToPagina = function () {
            vm.start = UserService.goToPagina(vm.pagina).start;
        };


        function detalle(id) {
            $location.path('/usuarios/' + id);
        }

        AcUtilsGlobals.isWaiting = true;
        $rootScope.$broadcast('IsWaiting');
        UserService.get(
            function (data) {
                for (var i = 0; i < data.length; i++) {
                    switch (data[i].rol_id) {
                        case 0:
                            data[i].rol_texto = 'Administrador';
                            break;
                        case 1:
                            data[i].rol_texto = 'Usuario';
                            break;
                        case 2:
                            data[i].rol_texto = 'Proveedor';
                            break;
                        case 3:
                            data[i].rol_texto = 'Cliente';
                            break;
                        case 4:
                            data[i].rol_texto = 'Mayorista';
                            break;
                    }
                }
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