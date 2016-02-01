(function () {

    'use strict';


    angular.module('nombreapp.stock.productos', ['ngRoute', 'toastr', 'nombreapp.stock.proveedores'
        , 'nombreapp.stock.categorias'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/productos/:id', {
                templateUrl: './productos/productos.html',
                controller: 'ProductosController',
                data: {requiresLogin: true}
            });
        }])

        .controller('ProductosController', ProductosController)
        .directive('dbinfOnFilesSelected', dbinfOnFilesSelected);

    ProductosController.$inject = ["$http", "$scope", "$routeParams", "ProductService", "$location", "toastr", 'UserService',
        'CategoriasService', 'ProductVars'];
    function ProductosController($http, $scope, $routeParams, ProductService, $location, toastr, UserService, CategoriasService,
                                 ProductVars) {
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
        vm.categoria = '0';
        vm.producto = {
            nombre: '',
            descripcion: '',
            pto_repo: 0,
            status: '1',
            destacado: '0',
            fotos: [],
            precios: [],
            proveedores: [],
            categoria: '0',
            sku: '',
            stocks: [],
            producto_tipo: '0',
            kits: []
        };
        //vm.proveedores = [
        //    {usuario_id: '1', nombre: 'prov01'},
        //    {usuario_id: '2', nombre: 'prov02'},
        //    {usuario_id: '3', nombre: 'prov03'},
        //    {usuario_id: '4', nombre: 'prov04'}
        //];
        vm.proveedores = [];

        var foto = {nombre: '', destacado: ''};
        var precio = {tipo: '', precio: ''};


        //vm.mostrar = function(){
        //  console.log(vm.listProveedores);
        //};


        function searchProductoKit() {
            if (vm.producto_kit_busqueda.length > 2) {
                ProductService.getByParams('nombre,sku', vm.producto_kit_busqueda, 'false', function (data) {
                    vm.productos_kit = [];
                    vm.productos_kit = data;
                });
            }
        }

        function agregarKit(producto_kit) {
            ProductService.getByParams('producto_id', '' + producto_kit.producto_id, 'true', function (data) {
                vm.producto.kits.push({
                    producto_cantidad: 1,
                    producto_id: producto_kit.producto_id,
                    nombre: data[0].nombre
                });
            });

        }


        function quitarKit(producto_kit) {
            for (var i = 0; i < vm.producto.kits.length; i++) {
                if (producto_kit.producto_id == vm.producto.kits[i].producto_id) {

                    vm.producto.kits.splice(i, 1);
                }
            }
            //vm.productos_en_kit(producto);
        }


        if (vm.id == 0) {
            CategoriasService.getCategorias(function (data) {
                vm.categorias = data;
                vm.producto.categoria_id = data[0].categoria_id;
            });

            UserService.getByParams('rol_id', '2', 'true', function (data) {
                //console.log(data);
                vm.proveedores = data;

            });

            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;
            UserService.getByParams('rol_id', '2', 'true', function (data) {
                vm.proveedores = data;
                CategoriasService.getCategorias(function (data) {
                    vm.categorias = data;
                    vm.producto.categoria_id = data[0].categoria_id;
                    ProductService.getByParams('producto_id', vm.id, 'true', function (data) {
                        vm.producto = data[0];
                        vm.producto.pto_repo = parseInt(vm.producto.pto_repo);
                        vm.producto.producto_tipo = '' + vm.producto.producto_tipo;
                        vm.producto.destacado = '' + vm.producto.destacado;
                        vm.producto.status = '' + vm.producto.status;
                        vm.producto.en_slider = '' + vm.producto.en_slider;
                        vm.producto.en_oferta = '' + vm.producto.en_oferta;
                        vm.categoria = vm.producto.categorias.length > 0 ? vm.producto.categorias[0].categoria_id : 1;
                        vm.precio_minorista = 0;
                        vm.precio_mayorista = 0;
                        vm.precio_oferta = 0;

                        for (var i = 0; i < 3; i++) {

                            if (vm.producto.precios[i].precio_tipo_id == 0) {
                                vm.precio_minorista = parseFloat(vm.producto.precios[i].precio);
                            }
                            if (vm.producto.precios[i].precio_tipo_id == 1) {
                                vm.precio_mayorista = parseFloat(vm.producto.precios[i].precio);
                            }
                            if (vm.producto.precios[i].precio_tipo_id == 2) {
                                vm.precio_oferta = parseFloat(vm.producto.precios[i].precio);
                            }
                        }

                        for (var i = 0; i < vm.producto.proveedores.length; i++) {
                            vm.listProveedores[vm.producto.proveedores[i].usuario_id] = true;
                        }

                        for(var i = 0; i< vm.producto.kits.length; i++){
                            ProductService.getByParams('producto_id', ''+vm.producto.kits[i].producto_id, 'true', function(data){
                                vm.producto.kits[i].nombre = data[0].nombre;
                            } );

                        }

                        //vm.productos_en_kit = data.productos_kit;
                        //console.log(vm.listProveedores);


                    });
                });
            });
        }

        function deleteProducto() {

            var r = confirm("Realmente desea eliminar el producto? Esta operación no tiene deshacer. Si solo desea ocultarlo, cambie el estado a 'Inactivo'");
            if (r) {
                ProductService.remove(vm.id, function (data) {
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

            if (vm.producto.pto_repo == undefined ||
                vm.producto.pto_repo == 0) {
                toastr.error('Debe ingresar un punto de reposición');
                return;
            }


            if (vm.producto.status == null) {
                toastr.error('Debe ingresar un estado');
                return;
            }

            if (vm.categoria == null) {
                toastr.error('Debe ingresar una categoria');
                return;
            }

            if (vm.producto.destacado == null) {
                toastr.error('Debe indicar si el producto se encuentra destacado');
                return;
            }


            vm.producto.precios = [];
            vm.producto.proveedores = [];

            precio = {precio_tipo_id:0, precio:vm.precio_minorista};
            vm.producto.precios.push(precio);

            precio = {precio_tipo_id:1, precio:vm.precio_mayorista};
            vm.producto.precios.push(precio);


            precio = {precio_tipo_id:2, precio:vm.precio_oferta};
            vm.producto.precios.push(precio);

            if(vm.producto.categorias == undefined || vm.producto.categorias.length == 0){
                vm.producto.categorias =[];
                vm.producto.categorias.push({categoria_id:0});
            }
            vm.producto.categorias[0].categoria_id = vm.categoria;

            //vm.producto.productos_kit = vm.productos_en_kit;


            if (vm.listProveedores.length < 1) {
                toastr.error("Debe seleccionar un proveedor");
                return;
            }

            for (var prop in vm.listProveedores) {

                if (vm.listProveedores[prop]) {
                    vm.producto.proveedores.push({proveedor_id:prop});
                }

                //console.log("o." + prop + " = " + vm.listProveedores[prop]);
            }

            console.log(vm.producto);

            if (vm.isUpdate) {
                ProductService.update(vm.producto, function (data) {

                    uploadImages();
                    ProductVars.clearCache = true;
                });
            } else {
                ProductService.create(vm.producto, function (data) {

                    uploadImages();
                    ProductVars.clearCache = true;
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



})();

