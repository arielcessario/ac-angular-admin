(function () {

    'use strict';


    angular.module('nombreapp.stock.productos', ['ngRoute', 'toastr', 'nombreapp.stock.proveedores'
        , 'nombreapp.stock.categorias'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/productos/:id', {
                templateUrl: './productos/productos.html',
                controller: 'ProductosController'
            });
        }])

        .controller('ProductosController', ProductosController)
        .service('ProductosService', ProductosService)
        .directive('dbinfOnFilesSelected', dbinfOnFilesSelected);

    ProductosController.$inject = ["$http", "$scope", "$routeParams", "ProductosService", "$location", "toastr", 'ProveedoresService',
        'CategoriasService'];
    function ProductosController($http, $scope, $routeParams, ProductosService, $location, toastr, ProveedoresService, CategoriasService) {
        var vm = this;
        vm.isUpdate = false;
        vm.status = 1;
        vm.destacado = 0;
        vm.fotos = [];
        $scope.agregarImagen = agregarImagen;
        vm.save = save;
        vm.deleteImage = deleteImage;
        vm.delete = deleteProducto;
        vm.listProveedores = [];
        vm.id = $routeParams.id;
        vm.categorias = [];
        vm.producto = {
            nombre: '',
            descripcion: '',
            ptoRepo: 0,
            status: 1,
            destacado: 0,
            fotos: [],
            precios: [],
            proveedores: [],
            categoria: 0,
            sku: '',
            stocks: [],
            insumo: 0
        };
        //vm.proveedores = [
        //    {proveedor_id: '1', nombre: 'prov01'},
        //    {proveedor_id: '2', nombre: 'prov02'},
        //    {proveedor_id: '3', nombre: 'prov03'},
        //    {proveedor_id: '4', nombre: 'prov04'}
        //];
        vm.proveedores = [];

        var foto = {nombre: '', destacado: ''};
        var precio = {tipo: '', precio: ''};


        //vm.mostrar = function(){
        //  console.log(vm.listProveedores);
        //};

        ProveedoresService.getProveedores(function (data) {
            //console.log(data);
            vm.proveedores = data;

        });

        CategoriasService.getCategorias(function (data) {
            vm.categorias = data;
            vm.producto.categoria_id = data[0].categoria_id;
        });


        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            ProductosService.getProductoByID(vm.id, function (data) {
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

        function deleteProducto() {

            var r = confirm("Realmente desea eliminar el producto? Esta operación no tiene deshacer. Si solo desea ocultarlo, cambie el estado a 'Inactivo'");
            if (r) {
                ProductosService.deleteProducto(vm.id, function (data) {
                    toastr.success('Producto eliminado');
                    $location.path('/listado_productos');
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


            if (vm.listProveedores.length < 1) {
                toastr.error("Debe seleccionar un proveedor");
                return;
            }

            for (var prop in vm.listProveedores) {

                if (vm.listProveedores[prop]) {
                    vm.producto.proveedores.push(prop);
                }

                //console.log("o." + prop + " = " + vm.listProveedores[prop]);
            }

            //console.log(vm.producto);

            if (vm.isUpdate) {
                ProductosService.saveProducto(vm.producto, 'update', function (data) {

                    uploadImages();
                });
            } else {
                ProductosService.saveProducto(vm.producto, 'save', function (data) {

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

                toastr.success("Producto guardado con éxito");
                $location.path('/listado_productos');


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

    function dbinfOnFilesSelected() {
        return {
            restrict: 'A',
            scope: {
                //attribute data-dbinf-on-files-selected (normalized to dbinfOnFilesSelected) identifies the action
                //to take when file(s) are selected. The '&' says to  execute the expression for attribute
                //data-dbinf-on-files-selected in the context of the parent scope. Note though that this '&'
                //concerns visibility of the properties and functions of the parent scope, it does not
                //fire the parent scope's $digest (dirty checking): use $scope.$apply() to update views
                //(calling scope.$apply() here in the directive had no visible effect for me).
                dbinfOnFilesSelected: '&'
            },
            link: function (scope, element, attr, Controller) {
                element.bind("change", function () {  //match the selected files to the name 'selectedFileList', and
                    //execute the code in the data-dbinf-on-files-selected attribute
                    scope.dbinfOnFilesSelected({selectedFileList: element[0].files});
                });
            }
        }
    }

    ProductosService.$inject = ['$http'];
    function ProductosService($http) {
        var service = {};
        var sucursal_id = 1;

        service.getProductos = getProductos;
        service.getProductoByID = getProductoByID;
        service.getProductoByNameOrSKU = getProductoByNameOrSKU;
        service.getProductoByName = getProductoByName;
        service.getProductoByNameProv = getProductoByNameProv;
        service.getProductosVenta = getProductosVenta;
        service.saveProducto = saveProducto;
        service.deleteProducto = deleteProducto;


        return service;

        function getProductos(callback) {
            return $http.post('./stock-api/stock.php',
                {function: 'getProductos'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function getProductoByID(id, callback) {
            getProductos(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.producto_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getProductoByNameOrSKU(name, callback) {
            getProductos(function (data) {
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    var stockEnSucursal = false;

                    for(var i = 0; i < elem.stocks.length; i++){
                        if(elem.stocks[i].sucursal_id == sucursal_id){
                            stockEnSucursal = true;
                        }

                    }

                    if (stockEnSucursal && ((n !== undefined && n > -1) || elem.sku == name )) {
                        return elem;
                    }
                });
                callback(response);
            })

        }

        function getProductoByName(name, callback) {
            getProductos(function (data) {
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

        function getProductosVenta(name, sucursal_id, callback) {
            getProductos(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        var conStock = false;
                        for(var i = 0; i< elem.stocks.length; i++){
                            if(elem.stocks[i].sucursal_id = sucursal_id){
                                conStock = true;
                            }

                        }

                        if(conStock){
                            return elem;
                        }
                    }
                });
                callback(response);
            })

        }

        function getProductoByNameProv(name, proveedor_id, callback) {
            getProductos(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    //console.log(elem);

                    //console.log('provee ' + proveedor_id);

                    var provs = elem.proveedores;
                    var prov_encontrado = false;
                    for (var i = 0; i < provs.length; i++) {
                        //console.log('for ' + provs[i].proveedor_id);
                        if (provs[i].proveedor_id == proveedor_id) {
                            prov_encontrado = true;
                        }
                    }

                    if (!prov_encontrado) {
                        return;
                    }

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

        function saveProducto(producto, _function, callback) {

            return $http.post('./stock-api/stock.php',
                {function: _function, producto: JSON.stringify(producto)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }


        function deleteProducto(id, callback) {
            return $http.post('./stock-api/stock.php',
                {function: 'deleteProducto', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

