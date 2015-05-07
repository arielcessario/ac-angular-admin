(function () {

    'use strict';


    angular.module('nombreapp.stock.proveedores', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/proveedores/:id', {
                templateUrl: './proveedores/proveedores.html',
                controller: 'ProveedoresController'
            });
        }])

        .controller('ProveedoresController', ProveedoresController)
        .service('ProveedoresService', ProveedoresService);

    ProveedoresController.$inject = ["$http", "$scope", "$routeParams", "ProveedoresService", "$location", "toastr"];
    function ProveedoresController($http, $scope, $routeParams, ProveedoresService, $location, toastr) {
        var vm = this;
        vm.isUpdate = false;
        vm.status = 1;
        vm.destacado = 0;
        vm.fotos = [];
        $scope.agregarImagen = agregarImagen;
        vm.save = save;
        vm.deleteImage = deleteImage;
        vm.delete = deleteProveedor;
        vm.listProveedores = [];
        vm.id = $routeParams.id;
        vm.producto = {
            nombre: '',
            descripcion: '',
            ptoRepo: 0,
            status: 1,
            destacado: 0,
            fotos: [],
            precios: [],
            proveedores: []
        };
        vm.proveedores = [
            {proveedor_id: '1', nombre: 'prov01'},
            {proveedor_id: '2', nombre: 'prov02'},
            {proveedor_id: '3', nombre: 'prov03'},
            {proveedor_id: '4', nombre: 'prov04'}
        ];

        var foto = {nombre: '', destacado: ''};
        var precio = {tipo: '', precio: ''};


        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            ProveedoresService.getProveedorByID(vm.id, function (data) {
                vm.producto = data;
                vm.producto.ptoRepo = parseInt(data.pto_repo);

                vm.precio_minorista = 0;
                vm.precio_mayorista = 0;
                vm.precio_web = 0;

                for (var i = 0; i < 3; i++) {

                    if (data.precios[i].precio_tipo_id == 0) {
                        vm.precio_minorista = parseFloat(data.precios[i].precio);
                    }
                    if (data.precios[i].precio_tipo_id == 1) {
                        vm.precio_mayorista = parseFloat(data.precios[i].precio);
                    }
                    if (data.precios[i].precio_tipo_id == 2) {
                        vm.precio_web = parseFloat(data.precios[i].precio);
                    }
                }

                for (var i = 0; i < data.proveedores.length; i++) {
                    vm.listProveedores[data.proveedores[i].proveedor_id] = true;
                }

                //console.log(vm.listProveedores);


            });
        }

        function deleteProveedor() {

            var r = confirm("Realmente desea eliminar el producto? Esta operación no tiene deshacer. Si solo desea ocultarlo, cambie el estado a 'Inactivo'");
            if (r) {
                ProveedoresService.deleteProveedor(vm.id, function (data) {
                    toastr.success('Proveedor eliminado');
                    $location.path('/listado_proveedores');
                });
            }
        }

        function save() {

            vm.producto.precios = [];
            vm.producto.proveedores = [];

            precio = {};
            precio.tipo = 0;
            precio.precio = vm.precio_minorista;
            vm.producto.precios.push(precio);

            precio = {};
            precio.tipo = 1;
            precio.precio = vm.precio_mayorista;
            vm.producto.precios.push(precio);


            precio = {};
            precio.tipo = 2;
            precio.precio = vm.precio_web;
            vm.producto.precios.push(precio);


            for (var prop in vm.listProveedores) {

                if (vm.listProveedores[prop]) {
                    vm.producto.proveedores.push(prop);
                }
                //console.log("o." + prop + " = " + vm.listProveedores[prop]);
            }

            //console.log(vm.producto);

            if (vm.isUpdate) {
                ProveedoresService.saveProveedor(vm.producto, 'update', function (data) {

                    uploadImages();
                });
            } else {
                ProveedoresService.saveProveedor(vm.producto, 'save', function (data) {

                    uploadImages();
                });
            }
        }

        function deleteImage(name) {
            var r = confirm('Desea eliminar la imagen?');
            if (r) {
                vm.fotos.forEach(function (entry, index, array) {
                    if (entry.name === name) {
                        array.splice(index, 1);
                    }

                });

                vm.producto.fotos.forEach(function (entry, index, array) {
                    if (entry.nombre === name) {
                        array.splice(index, 1);
                    }

                });


            }

        }

        function uploadImages() {
            //var files = document.getElementById("images");
            //console.log(files.files[0]);
            //console.log(vm.fotos);

            var form_data = new FormData();

            vm.fotos.forEach(function (entry) {

                //form_data.append('images', files.files[0]);
                //console.log(entry);
                form_data.append('images', entry);
            });

            var ajax = new XMLHttpRequest();
            ajax.onprogress = function () {

            };
            ajax.onload = function (data) {
                //console.log(data);

                toastr.success("Proveedor guardado con éxito");
                $location.path('/listado_proveedores');


            };
            ajax.open("POST", "./stock-api/upload.php");
            ajax.send(form_data);


        }

        function agregarImagen(filelist) {
            for (var i = 0; i < filelist.length; ++i) {
                var file = filelist.item(i);
                //do something with file; remember to call $scope.$apply() to trigger $digest (dirty checking)
                //imagesList.push(file);
                vm.fotos.push(file);
                foto = {};
                foto.nombre = file.name;
                foto.destacado = 1;
                vm.producto.fotos.push(foto);
                //console.log((vm.producto.fotos));
            }
            $scope.$apply();
        }
    }



    ProveedoresService.$inject = ['$http'];
    function ProveedoresService($http) {
        var service = {};
        var url = './stock-api/proveedores.php';
        service.getProveedores = getProveedores;
        service.getProveedorByID = getProveedorByID;
        service.getProveedorByName = getProveedorByName;
        service.saveProveedor = saveProveedor;
        service.deleteProveedor = deleteProveedor;


        return service;

        function getProveedores(callback) {
            return $http.post(url,
                {function: 'getProveedores'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function getProveedorByID(id, callback) {
            getProveedores(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.producto_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getProveedorByName(name, callback) {
            getProveedores(function (data) {
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



        function saveProveedor(producto, _function, callback) {

            return $http.post(url,
                {function: _function, producto: JSON.stringify(producto)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }


        function deleteProveedor(id, callback) {
            return $http.post(url,
                {function: 'deleteProveedor', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

