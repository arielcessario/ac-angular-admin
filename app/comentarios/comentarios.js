(function () {

    'use strict';


    angular.module('nombreapp.stock.comentarios', ['ngRoute', 'toastr', 'nombreapp.stock.proveedores'
        , 'nombreapp.stock.categorias'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/comentarios/:id', {
                templateUrl: './comentarios/comentarios.html',
                controller: 'ComentariosController',
                data: {requiresLogin: true}
            });
        }])

        .controller('ComentariosController', ComentariosController);

    ComentariosController.$inject = ["$http", "$scope", "$routeParams", "NoticiasService", "$location", "toastr"];
    function ComentariosController($http, $scope, $routeParams, NoticiasService, $location, toastr) {
        var vm = this;
        vm.isUpdate = false;

        vm.save = save;
        vm.delete = deleteComentario;
        vm.id = $routeParams.id;

        vm.comentario = {
            noticia_comentario_id: 0,
            noticia_id: 0,
            titulo: '',
            detalles: '',
            fecha: '',
            parent_id: 0,
            votos_up: 0,
            votos_down: [],
            creador_id: 0
        };




        if (vm.id == 0) {

            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            NoticiasService.getNoticiaByID(vm.id, function (data) {
                //console.log(data);
                vm.comentario = data.comentarios;

            });
        }

        function deleteComentario() {

            var r = confirm("Realmente desea eliminar el comentario? Esta operación no tiene deshacer. Si solo desea ocultarlo, cambie el estado a 'Inactivo'");
            if (r) {
                ComentariosService.deleteComentario(vm.id, function (data) {
                    toastr.success('Comentario eliminado');
                    $location.path('/listado_noticias');
                });
            }
        }

        function save() {



            //console.log(vm.comentario);

            if (vm.isUpdate) {
                NoticiasService.saveComentario(vm.comentario, 'updateComentario', function (data) {

                });
            } else {
                NoticiasService.saveComentario(vm.comentario, 'saveComentario', function (data) {
                });
            }
        }


    }



})();

