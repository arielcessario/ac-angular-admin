(function () {

    'use strict';


    angular.module('nombreapp.stock.usuarios', ['ngRoute', 'toastr', 'nombreapp.stock.nacionalidades'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/usuarios/:id', {
                templateUrl: './usuarios/usuarios.html',
                controller: 'UsuariosController',
                data: {requiresLogin: true}
            });
        }])

        .controller('UsuariosController', UsuariosController);

    UsuariosController.$inject = ["$routeParams", "UserService", "$location", "toastr", 'acNacionalidadesService', 'AcUtils'];
    function UsuariosController($routeParams, UserService, $location, toastr, acNacionalidadesService, AcUtils) {

        var vm = this;
        vm.isUpdate = false;
        vm.save = save;
        vm.delete = deleteUsuario;
        vm.id = $routeParams.id;
        vm.nacionalidades = [];
        vm.nacionalidad = {};
        vm.usuario = {
            nombre: '',
            apellido: '',
            mail: '',
            nacionalidad_id: {id: 12},
            tipo_doc: '0',
            nro_doc: '',
            comentarios: '',
            marcado: '0',
            fecha_nacimiento: '',
            news_letter: '1',
            rol_id: '1'
        };


        acNacionalidadesService.get(function (data) {
            //console.log(data);
            vm.nacionalidades = data;
            vm.nacionalidad = data[11];
        });

        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            UserService.getByParams('usuario_id', vm.id, 'true', function (data) {

                vm.usuario = data[0];
                vm.usuario.tipo_doc = '' + vm.usuario.tipo_doc;
                vm.usuario.rol_id = '' + vm.usuario.rol_id;
                vm.usuario.news_letter = '' + vm.usuario.news_letter;
                vm.nacionalidad.id = vm.usuario.nacionalidad_id;

            });
        }

        function deleteUsuario() {

            var r = confirm("Realmente desea eliminar la usuario? Esta operación no tiene deshacer.");
            if (r) {

                UserService.remove(vm.id, function (data) {
                    toastr.success('Usuario eliminado');
                    $location.path('/listado_usuarios');
                });
            }
        }


        function save() {
            if (vm.usuario.nombre == '') {
                toastr.error('El nombre es obligatorio');
                return;
            }
            //if (vm.usuario.apellido == '') {
            //    toastr.error('El apellido es obligatorio');
            //    return;
            //}
            if (!AcUtils.validateEmail(vm.usuario.mail)) {
                toastr.error('El mail debe tener un formato válido.');
                return;
            }
            if (vm.usuario.mail == '') {
                toastr.error('El mail es obligatorio');
                return;
            }
            if (vm.usuario.nro_doc == '') {
                toastr.error('El Nro de documento es obligatorio');
                return;
            }
            vm.usuario.nacionalidad_id = vm.nacionalidad.id;


            if (!vm.isUpdate) {
                UserService.create(vm.usuario, function (data) {

                    console.log(data);
                    if (!isNaN(data) && data > -1){
                        toastr.success('Usuario salvado con exito');
                        $location.path('/listado_usuarios');
                    }else{
                        toastr.error('Ha ocurrido un error.');
                    }
                });
            } else {
                UserService.update(vm.usuario, function (data) {

                    console.log(data);
                    if (!isNaN(data) && data > -1){
                        toastr.success('Usuario salvado con exito');
                        $location.path('/listado_usuarios');
                    }else{
                        toastr.error('Ha ocurrido un error.');
                    }
                });
            }
        }

    }

})();

