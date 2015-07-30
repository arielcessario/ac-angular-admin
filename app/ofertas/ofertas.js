(function () {

    'use strict';


    angular.module('nombreapp.stock.ofertas', ['ngRoute', 'toastr', 'nombreapp.stock.proveedores'
        , 'nombreapp.stock.categorias'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/ofertas', {
                templateUrl: './ofertas/ofertas.html',
                controller: 'OfertasController'
            });
        }])

        .controller('OfertasController', OfertasController)
        .service('OfertasService', OfertasService)
        .directive('dbinfOnFilesSelectedOfertas', dbinfOnFilesSelectedOfertas);

    OfertasController.$inject = ["$http", "$scope", "$routeParams", "OfertasService", "$location", "toastr",
    'ProductosService'];
    function OfertasController($http, $scope, $routeParams, OfertasService, $location, toastr,
                               ProductosService) {
        var vm = this;
        $scope.agregarImagen = agregarImagen;
        vm.producto_oferta_01 = '';
        vm.save = save;
        //vm.searchProductoParaOferta = searchProductoParaOferta;
        vm.fn_productos = ProductosService.getProductoByName;
        vm.lista_ofertas_01 = [];
        vm.producto_01 = {};
        var foto = {};
        var foto_01 = {};
        var foto_02 = {};
        var foto_03 = {};
        var foto_04 = {};

        vm.ofertas = [];
        vm.oferta_01 = {
            titulo: '',
            descripcion: '',
            imagen: 0,
            oferta_id: 1,
            precio: 0,
            producto_id: 0
        };

        vm.oferta_02 = {
            titulo: '',
            descripcion: '',
            imagen: 0,
            oferta_id: 1,
            precio: 0,
            producto_id: 0
        };

        vm.oferta_03 = {
            titulo: '',
            descripcion: '',
            imagen: 0,
            oferta_id: 1,
            precio: 0,
            producto_id: 0
        };

        vm.oferta_04 = {
            titulo: '',
            descripcion: '',
            imagen: 0,
            oferta_id: 1,
            precio: 0,
            producto_id: 0
        };



        OfertasService.getOfertas(function(data){
            data[0].precio = parseFloat(data[0].precio);
            data[1].precio = parseFloat(data[1].precio);
            data[2].precio = parseFloat(data[2].precio);
            data[3].precio = parseFloat(data[3].precio);
            vm.oferta_01 = data[0];
            vm.oferta_02 = data[1];
            vm.oferta_03 = data[2];
            vm.oferta_04 = data[3];
        });


        function save() {
                vm.oferta_01.producto_id = vm.oferta_01.producto[0].producto_id;
                vm.oferta_02.producto_id = vm.oferta_02.producto[0].producto_id;
                vm.oferta_03.producto_id = vm.oferta_03.producto[0].producto_id;
                vm.oferta_04.producto_id = vm.oferta_04.producto[0].producto_id;
                vm.ofertas.push(vm.oferta_01);
                vm.ofertas.push(vm.oferta_02);
                vm.ofertas.push(vm.oferta_03);
                vm.ofertas.push(vm.oferta_04);

                OfertasService.saveOferta(vm.ofertas, 'saveOferta', function (data) {
                    uploadImages(foto_01);
                    uploadImages(foto_02);
                    uploadImages(foto_03);
                    uploadImages(foto_04);
                    toastr.success('Ofertas actualizadas con exito.')
                });
        }


        function uploadImages(file) {
            //var files = document.getElementById("images");
            //console.log(files.files[0]);
            //console.log(vm.fotos);

            var form_data = new FormData();

            //vm.fotos.forEach(function (entry) {

                //form_data.append('images', files.files[0]);
                //console.log(entry);
                form_data.append('images', file);
            //});

            var ajax = new XMLHttpRequest();
            ajax.onprogress = function () {

            };
            ajax.onload = function (data) {
                //console.log(data);

                //toastr.success("Oferta guardado con éxito");
                //$location.path('/listado_ofertas');


            };
            ajax.open("POST", "./stock-api/upload.php");
            ajax.send(form_data);


        }

        function agregarImagen(filelist, oferta) {
            var file = filelist.item(0);
            switch (oferta){
                case 1:
                    vm.oferta_01.imagen = file.name;
                    foto_01 = file;
                    break;
                case 2:
                    vm.oferta_02.imagen = file.name;
                    foto_02 = file;
                    break;
                case 3:
                    vm.oferta_03.imagen = file.name;
                    foto_03 = file;
                    break;
                case 4:
                    vm.oferta_04.imagen = file.name;
                    foto_04 = file;
                    break;

            }




            //for (var i = 0; i < filelist.length; ++i) {
            //    var file = filelist.item(i);
            //    //do something with file; remember to call $scope.$apply() to trigger $digest (dirty checking)
            //    //imagesList.push(file);
            //    vm.fotos.push(file);
            //    foto = {};
            //    foto.nombre = file.name;
            //    foto.destacado = 1;
            //    vm.oferta.fotos.push(foto);
            //    //console.log((vm.oferta.fotos));
            //}
            $scope.$apply();
        }
    }

    function dbinfOnFilesSelectedOfertas() {
        return {
            restrict: 'A',
            scope: {
                //attribute data-dbinf-on-files-selected (normalized to dbinfOnFilesSelected) identifies the action
                //to take when file(s) are selected. The '&' says to  execute the expression for attribute
                //data-dbinf-on-files-selected in the context of the parent scope. Note though that this '&'
                //concerns visibility of the properties and functions of the parent scope, it does not
                //fire the parent scope's $digest (dirty checking): use $scope.$apply() to update views
                //(calling scope.$apply() here in the directive had no visible effect for me).
                dbinfOnFilesSelectedOfertas: '&'
            },
            link: function (scope, element, attr, Controller) {
                element.bind("change", function () {  //match the selected files to the name 'selectedFileList', and
                    //execute the code in the data-dbinf-on-files-selected attribute
                    scope.dbinfOnFilesSelectedOfertas({selectedFileList: element[0].files});
                });
            }
        }
    }

    OfertasService.$inject = ['$http', '$cacheFactory'];
    function OfertasService($http, $cacheFactory) {
        var service = {};
        var sucursal_id = 1;
        var clearCache = false;

        service.getOfertas = getOfertas;
        service.saveOferta = saveOferta;

        return service;

        function getOfertas(callback) {
            var $httpDefaultCache = $cacheFactory.get('$http');
            var cachedData = [];
            if (clearCache) {
                $httpDefaultCache.remove('./stock-api/ofertas.php?function=getOfertas');


            }


            return $http.get('./stock-api/ofertas.php?function=getOfertas', {cache: false})
                .success(function (data) {
                    callback(data);
                    clearCache = false;
                })
                .error();


        }

        function saveOferta(ofertas, _function, callback) {

            return $http.post('./stock-api/ofertas.php',
                {function: _function, ofertas: JSON.stringify(ofertas)})
                .success(function (data) {
                    callback(data);
                    clearCache = true;
                })
                .error();
        }

    }

})();

