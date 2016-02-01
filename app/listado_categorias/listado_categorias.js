(function () {
    'use strict';

    angular.module('nombreapp.stock.listadoCategorias', ['ngRoute', 'nombreapp.stock.categorias'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/listado_categorias', {
                templateUrl: './listado_categorias/listado_categorias.html',
                controller: 'ListadoCategoriasController',
                data: {requiresLogin: true}
            });
        }])

        .controller('ListadoCategoriasController', ListadoCategoriasController);


    ListadoCategoriasController.$inject = ['CategoryService', '$location'];
    function ListadoCategoriasController(CategoryService, $location) {

        var vm = this;

        vm.categorias = [];
        vm.detalle = detalle;
        vm.soloActivos = true;
        vm.loadCategorias = loadCategorias;

        loadCategorias();


        function detalle(id) {
            $location.path('/categorias/' + id);
        }


        function loadCategorias() {


            CategoryService.get(
                function (data) {
                    for(var i = 0; i < data.length; i++){
                        vm.categorias.push(data[i]);
                    }
                }
            );
        }


    }


})();