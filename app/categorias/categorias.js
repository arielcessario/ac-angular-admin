(function () {

    'use strict';


    angular.module('nombreapp.stock.categorias', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/categorias/:id', {
                templateUrl: './categorias/categorias.html',
                controller: 'CategoriasController'
            });
        }])

        .controller('CategoriasController', CategoriasController)
        .service('CategoriasService', CategoriasService);

    CategoriasController.$inject = ["$scope", "$routeParams", "CategoriasService", "$location", "toastr"];
    function CategoriasController($scope, $routeParams, CategoriasService, $location, toastr) {
        var vm = this;
        vm.isUpdate = false;
        
        vm.save = save;
        vm.delete = deleteCategoria;
        vm.id = $routeParams.id;
        vm.categoria = {
            nombre: ''
        };


        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            CategoriasService.getCategoriaByID(vm.id, function (data) {
                vm.categoria = data;
                
            });
        }

        function deleteCategoria() {

            var r = confirm("Realmente desea eliminar la categoria? Esta operación no tiene deshacer.");
            if (r) {

                CategoriasService.deleteCategoria(vm.id, function (data) {
                    toastr.success('Categoria eliminada');
                    $location.path('/listado_categorias');
                });
            }
        }

        function save() {

           

            if (vm.isUpdate) {
                CategoriasService.saveCategoria(vm.categoria, 'update', function (data) {

                    toastr.success('Categoria salvada con exito');
                    $location.path('/listado_categorias');
                });
            } else {
                CategoriasService.saveCategoria(vm.categoria, 'save', function (data) {


                    toastr.success('Categoria salvada con exito');
                    $location.path('/listado_categorias');
                });
            }
        }


    }



    CategoriasService.$inject = ['$http'];
    function CategoriasService($http) {
        var service = {};
        var url = './stock-api/categorias.php';
        service.getCategorias = getCategorias;
        service.getCategoriaByID = getCategoriaByID;
        service.getCategoriaByName = getCategoriaByName;
        service.saveCategoria = saveCategoria;
        service.deleteCategoria = deleteCategoria;


        return service;

        function getCategorias(callback) {
            return $http.post(url,
                {function: 'getCategorias'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function getCategoriaByID(id, callback) {
            getCategorias(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.categoria_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getCategoriaByName(name, callback) {
            getCategorias(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
                });
                callback(response);
            })

        }



        function saveCategoria(categoria, _function, callback) {

            return $http.post(url,
                {function: _function, categoria: JSON.stringify(categoria)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }


        function deleteCategoria(id, callback) {
            return $http.post(url,
                {function: 'deleteCategoria', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

