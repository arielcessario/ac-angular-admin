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
        .service('ProductosServiceUtils', ProductosServiceUtils)
        .directive('dbinfOnFilesSelected', dbinfOnFilesSelected);

    ProductosController.$inject = ["$http", "$scope", "$routeParams", "ProductosService", "$location", "toastr", 'ProveedoresService',
        'CategoriasService', 'ProductosServiceUtils'];
    function ProductosController($http, $scope, $routeParams, ProductosService, $location, toastr, ProveedoresService, CategoriasService,
                                 ProductosServiceUtils) {
        var vm = this;
        vm.isUpdate = false;
        vm.status = 1;
        vm.destacado = 0;
        vm.fotos = [];
        vm.producto_kit = {};
        vm.productos_kit = [];
        vm.productos_en_kit = [];
        vm.producto_kit_busqueda = '';
        $scope.agregarImagen = agregarImagen;
        vm.save = save;
        vm.agregarKit = agregarKit;
        vm.quitarKit = quitarKit;
        vm.searchProductoKit = searchProductoKit;
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
            producto_tipo: 0,
            productos_kit: []
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


        function searchProductoKit() {
            if (vm.producto_kit_busqueda.length > 2) {
                ProductosService.getProductoByName(vm.producto_kit_busqueda, function (data) {
                    vm.productos_kit = [];
                    vm.productos_kit = data;
                });
            }
        }

        function agregarKit(producto_kit) {
            vm.productos_en_kit.push(producto_kit);
        }


        function quitarKit(producto_kit) {
            for (var i = 0; i < vm.productos_en_kit.length; i++) {
                if (producto_kit.producto_id == vm.productos_en_kit[i].producto_id) {

                    vm.productos_en_kit.splice(i, 1);
                }
            }
            //vm.productos_en_kit(producto);
        }


        if (vm.id == 0) {
            CategoriasService.getCategorias(function (data) {
                vm.categorias = data;
                vm.producto.categoria_id = data[0].categoria_id;
            });

            ProveedoresService.getProveedores(function (data) {
                //console.log(data);
                vm.proveedores = data;

            });

            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;
            ProveedoresService.getProveedores(function (data) {
                //console.log(data);
                vm.proveedores = data;
                CategoriasService.getCategorias(function (data) {
                    vm.categorias = data;
                    vm.producto.categoria_id = data[0].categoria_id;
                    ProductosService.getProductoByID(vm.id, function (data) {
                        //console.log(data);
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


                        vm.productos_en_kit = data.productos_kit;
                        //console.log(vm.listProveedores);


                    });
                });
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

            //if(vm.producto.sku == undefined ||
            //    vm.producto.sku.length == 0){
            //    toastr.error('Debe ingresar un SKU');
            //    return;
            //}
            //console.log(vm.producto);

            if (vm.producto.descripcion == '' ||
                vm.producto.descripcion == 0) {
                toastr.error('Debe ingresar una descripcion');
                return;
            }

            if (vm.producto.ptoRepo == undefined ||
                vm.producto.ptoRepo == 0) {
                toastr.error('Debe ingresar un punto de reposición');
                return;
            }


            if (vm.producto.status == null) {
                toastr.error('Debe ingresar un estado');
                return;
            }

            if (vm.producto.categoria_id == null) {
                toastr.error('Debe ingresar una categoria');
                return;
            }

            if (vm.producto.destacado == null) {
                toastr.error('Debe indicar si el producto se encuentra destacado');
                return;
            }


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

            vm.producto.productos_kit = vm.productos_en_kit;


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
                    ProductosServiceUtils.clearCache = true;
                });
            } else {
                ProductosService.saveProducto(vm.producto, 'save', function (data) {

                    uploadImages();
                    ProductosServiceUtils.clearCache = true;
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

    function ProductosServiceUtils() {
        this.clearCache = true;
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

    ProductosService.$inject = ['$http', '$cacheFactory', 'ProductosServiceUtils', 'AcUtilsGlobals'];
    function ProductosService($http, $cacheFactory, ProductosServiceUtils, AcUtilsGlobals) {
        var service = {};
        var sucursal_id = 1;
        var clearCache = true;

        service.getProductos = getProductos;
        service.getProductosFromTo = getProductosFromTo;
        service.getProductoByID = getProductoByID;
        service.getProductoByNameOrSKU = getProductoByNameOrSKU;
        service.getProductoByName = getProductoByName;
        service.getProductoByNameProv = getProductoByNameProv;
        service.getProductosVenta = getProductosVenta;
        service.saveProducto = saveProducto;
        service.deleteProducto = deleteProducto;
        service.getProductoByNameOrSKUAndSucursal = getProductoByNameOrSKUAndSucursal;


        return service;

        function getProductos(callback) {
            var $httpDefaultCache = $cacheFactory.get('$http');
            var cachedData = [];


            if ($httpDefaultCache.get('./stock-api/stock.php?function=getProductos') != undefined) {
                if (ProductosServiceUtils.clearCache) {
                    $httpDefaultCache.remove('./stock-api/stock.php?function=getProductos');
                }
                else {
                    //console.log('lo');
                    cachedData = $httpDefaultCache.get('./stock-api/stock.php?function=getProductos');
                    callback(cachedData);
                    return;
                }
            }


            return $http.get('./stock-api/stock.php?function=getProductos', {cache: false})
                .success(function (data) {
                    $httpDefaultCache.put('./stock-api/stock.php?function=getProductos', data);
                    ProductosServiceUtils.clearCache = false;
                    callback(data);

                })
                .error(function(data){

                });

            //return cachedData;

            //$http({
            //    method: 'GET',
            //    url: './stock-api/stock.php',
            //    params: 'function=getProductos'
            //}).success(function(data){
            //    console.log(data);
            //    // With the data succesfully returned, call our callback
            //    callback(data);
            //}).error(function(){
            //    alert("error");
            //});
        }

        function getProductosFromTo(start, amount, callback) {
            getProductos(function (data) {
                callback(data.splice(start, start + amount));
            });
        }

        //function getProductos(callback) {
        //    return $http.post('./stock-api/stock.php',
        //        {function: 'getProductos'},
        //        {cache: true})
        //        .success(function (data) {
        //            callback(data);
        //        })
        //        .error();
        //}

        function getProductoByID(id, callback) {
            getProductos(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.producto_id === parseInt(id);
                })[0];
                //console.log(response);
                callback(response);
            })

        }

        function getProductoByNameOrSKU(name, callback) {
            getProductos(function (data) {
                var response = data.filter(function (elem, index, array) {

                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    var stockEnSucursal = false;

                    for (var i = 0; i < elem.stocks.length; i++) {
                        if (elem.stocks[i].sucursal_id == sucursal_id) {
                            stockEnSucursal = true;
                        }

                    }

                    if (stockEnSucursal && ((n !== undefined && n > -1) || elem.sku == name )) {

                        //var retorno = angular.clone(elem);

                        //return elem;
                        //var detalle = {
                        //    categoria: elem.categoria,
                        //    cagegoria_id:elem.categoria_id,
                        //    cuenta_id:elem.cuenta_id,
                        //    descripcion:elem.descripcion,
                        //    destacado:elem.destacado,
                        //    fotos:elem.fotos,
                        //    nombre:elem.nombre,
                        //    precios:elem.precios,
                        //    producto_id:elem.producto_id,
                        //    producto_tipo:elem.producto_tipo,
                        //    productos_kit:elem.productos_kit,
                        //    proveedores:elem.proveedores,
                        //    pto_repo:elem.pto_repo,
                        //    sku:elem.sku,
                        //    status:elem.status,
                        //    stocks:elem.stocks,
                        //    vendidos:elem.vendidos
                        //};
                        return elem;
                    }
                });
                callback(response);
            })

        }




        function getProductoByNameOrSKUAndSucursal(name, callback) {
            getProductos(function (data) {
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    var stockEnSucursal = false;
                    //console.log(AcUtilsGlobals.sucursal_auxiliar_id);

                    for (var i = 0; i < elem.stocks.length; i++) {
                        //console.log(elem.stocks[i].sucursal_id);
                        if (elem.stocks[i].sucursal_id == AcUtilsGlobals.sucursal_auxiliar_id) {
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
                        for (var i = 0; i < elem.stocks.length; i++) {
                            if (elem.stocks[i].sucursal_id = sucursal_id) {
                                conStock = true;
                            }

                        }

                        if (conStock) {
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
                    clearCache = true;
                })
                .error(function(data){});
        }


        function deleteProducto(id, callback) {
            return $http.post('./stock-api/stock.php',
                {function: 'deleteProducto', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error(function(data){});
        }

    }

})();

