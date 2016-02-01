(function () {

    'use strict';


    angular.module('nombreapp.stock.fraccionado', ['ngRoute', 'toastr', 'acMovimientos'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/fraccionado', {
                templateUrl: './fraccionado/fraccionado.html',
                controller: 'FraccionadoController',
                data: {requiresLogin: true}
            });
        }])

        .controller('FraccionadoController', FraccionadoController)
        .service('FraccionadoService', FraccionadoService);

    FraccionadoController.$inject = ["$scope", "$routeParams", "FraccionadoService", "$location", "toastr", "MovimientosService",
        'StockService', 'ProductService', 'StockVars'];
    function FraccionadoController($scope, $routeParams, FraccionadoService, $location, toastr, MovimientosService,
                                   StockService, ProductService, StockVars) {
        var vm = this;
        // Productos tipo 4 para fraccionar que tengan stock mayor a 0
        vm.productos_a_fraccionar = [];
        vm.producto_a_fraccionar = {};
        // Productos que se generan a partir del fraccionado, es el resultado luego de fraccionar
        vm.productos = [];
        vm.producto = {};
        vm.searchProductText = '';
        vm.searchProductTextAFraccionar = '';
        vm.cant_esperada = 0;
        vm.cant_obtenida = 0;
        vm.completo = false;
        vm.costo_uni = (vm.producto_a_fraccionar.costo_uni * vm.producto_a_fraccionar.cant_inicial) / vm.cant_esperada;
        var oldIndex = 0;
        var selecciona = false;
        var oldIndexAFraccionar = 0;
        var seleccionaAFraccionar = false;

        vm.moveInProductSearch = moveInProductSearch;
        vm.moveInProductSearchAFraccionar = moveInProductSearchAFraccionar;
        vm.save = save;

        StockService.getFraccionables(function (data) {
        });

        /**
         * @description Depende de la tecla presionada en el input de búsqueda o la lista, realiza una acción
         * @param event
         */
        function moveInProductSearch(event) {


            if (event.target.type == 'text') {
                // Flecha para abajo
                if (event.keyCode == 40) {
                    var elem = angular.element(document.querySelector('#resultsSearchProducts'));
                    elem[0].focus();
                }

                oldIndex = vm.productos.indexOf(vm.producto);
            } else {
                // Flecha para arriba
                if (event.keyCode == 38) {
                    if (vm.productos_a_fraccionar.indexOf(vm.producto) == 0 && oldIndex == 0) {
                        var elem = angular.element(document.querySelector('#txtSearchId'));
                        elem[0].focus();
                    }
                    oldIndex = vm.productos.indexOf(vm.producto);

                }

                if (event.keyCode == 40) {
                    oldIndex = vm.productos.indexOf(vm.producto);
                }

                if (event.keyCode == 13 || event.type == 'click') {
                    selecciona = true;
                    vm.searchProductText = vm.producto.nombre;
                    var elem = angular.element(document.querySelector('#cant_esperada'));
                    elem[0].focus();

                }
            }

        }

        /**
         * @description Depende de la tecla presionada en el input de búsqueda o la lista, realiza una acción
         * @param event
         */
        function moveInProductSearchAFraccionar(event) {


            if (event.target.type == 'text') {
                // Flecha para abajo
                if (event.keyCode == 40) {
                    var elem = angular.element(document.querySelector('#resultsSearchProductsAFraccionar'));
                    elem[0].focus();
                }

                oldIndexAFraccionar = vm.productos_a_fraccionar.indexOf(vm.producto_a_fraccionar);
            } else {
                // Flecha para arriba
                if (event.keyCode == 38) {
                    if (vm.productos_a_fraccionar.indexOf(vm.producto_a_fraccionar) == 0 && oldIndexAFraccionar == 0) {
                        var elem = angular.element(document.querySelector('#txtSearchIdAFraccionar'));
                        elem[0].focus();
                    }
                    oldIndexAFraccionar = vm.productos_a_fraccionar.indexOf(vm.producto_a_fraccionar);

                }

                if (event.keyCode == 40) {
                    oldIndexAFraccionar = vm.productos_a_fraccionar.indexOf(vm.producto_a_fraccionar);
                }

                if (event.keyCode == 13 || event.type == 'click') {
                    selecciona = true;
                    vm.searchProductTextAFraccionar = vm.producto_a_fraccionar.nombreProducto;
                    var elem = angular.element(document.querySelector('#txtSearchId'));
                    elem[0].focus();

                }
            }

        }

        /**
         * @description Búsqueda de productos en general
         */
        $scope.$watch('fraccionadoCtrl.searchProductText', function () {

            if (vm.searchProductText.replace(' ', '').length > 0) {


                if (!selecciona) {
                    ProductService.getByParams('nombre', '' + vm.searchProductText, 'false', function (data) {
                        vm.productos = data.filter(function (elem, index, array) {
                            if (elem.nombre.toLowerCase().indexOf(vm.searchProductText.toLowerCase()) > -1) {

                                return elem;
                            }
                        });


                    })
                } else {
                    selecciona = false;
                }
            } else {
                vm.productos = [];
            }

        });


        /**
         * @description Búsqueda de productos a Fraccionar
         */
        $scope.$watch('fraccionadoCtrl.searchProductTextAFraccionar', function () {

            if (vm.searchProductTextAFraccionar.replace(' ', '').length > 0) {


                if (!seleccionaAFraccionar) {
                    StockService.getFraccionables(function (data) {
                        vm.productos_a_fraccionar = data.filter(function (elem, index, array) {
                            if (elem.nombreProducto.toLowerCase().indexOf(vm.searchProductTextAFraccionar.toLowerCase()) > -1) {
                                return elem;
                            }
                        });


                    })
                } else {
                    seleccionaAFraccionar = false;
                }
            } else {
                vm.productos_a_fraccionar = [];
            }

        });


        function save() {
            var detalles = [];
            var detalle = {};

            if (vm.producto.producto_id == undefined || vm.producto_a_fraccionar.producto_id == undefined) {
                return
            }

            var producto_a_fraccionar = {
                producto_tipo: 4,
                precio_unidad: vm.producto_a_fraccionar.costo_uni,
                producto_id: vm.producto_a_fraccionar.producto_id,
                cantidad: vm.producto_a_fraccionar.cant_inicial,
                proveedor_id: vm.producto_a_fraccionar.proveedor_id
            };
            var producto_fraccionado = {
                producto_tipo: vm.producto.producto_tipo,
                precio_unidad: (vm.producto_a_fraccionar.costo_uni * vm.producto_a_fraccionar.cant_inicial) / vm.cant_esperada,
                producto_id: vm.producto.producto_id,
                cantidad: vm.cant_obtenida,
                proveedor_id: vm.producto_a_fraccionar.proveedor_id
            };
            var desperdicio = {
                producto_tipo: -1,
                precio_unidad: (vm.producto_a_fraccionar.costo_uni * vm.producto_a_fraccionar.cant_inicial) / vm.cant_esperada,
                producto_id: vm.producto.producto_id,
                cantidad: vm.cant_esperada - vm.cant_obtenida,
                proveedor_id: vm.producto_a_fraccionar.proveedor_id
            };

            var items = [];
            items.push(producto_a_fraccionar);
            items.push(producto_fraccionado);
            items.push(desperdicio);


            detalle = {};
            detalle.producto_id = vm.producto.producto_id;
            detalle.proveedor_id = vm.producto_a_fraccionar.proveedor_id;
            //detalle.sucursal_id = vm.pedido.sucursal_id;
            detalle.sucursal_id = 1;
            detalle.cant_inicial = vm.cant_obtenida;
            detalle.cant_actual = vm.cant_obtenida;
            detalle.precio_unidad = (vm.producto_a_fraccionar.costo_uni * vm.producto_a_fraccionar.cant_inicial) / vm.cant_esperada;
            detalles.push(detalle);

            vm.forma_pago = '-01';


            //console.log(vm.producto_a_fraccionar.stock_id);
            //console.log(detalles);
            //console.log(items);

            //(tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, cliente_id, usuario_id, comentario, callback)
            MovimientosService.armarMovimiento('016', '', 1, vm.forma_pago, '', (vm.producto_a_fraccionar.costo_uni * vm.producto_a_fraccionar.cant_inicial), '', 'Fraccionado de producto', items, vm.producto_a_fraccionar.proveedor_id, 1, 'Fraccionado de producto', function (data) {
                console.log(data);
                StockService.create(detalles, function (data) {
                    console.log(data);

                    if (!vm.completo) {
                        StockVars.clearCache = true;
                        StockService.get(function (data) {
                        });
                        toastr.success('Fraccionado realizado');
                        $location.path('/cajas/0');
                    } else {

                        StockService.update({
                            stock_id: vm.producto_a_fraccionar.stock_id,
                            cant_actual: 0
                        }, function (data) {
                            console.log(data);
                            StockVars.clearCache = true;
                            StockService.get(function (data) {
                            });
                            toastr.success('Fraccionado realizado');
                            $location.path('/cajas/0');
                        });
                    }
                });
            });
        }
    }


    FraccionadoService.$inject = ['$http'];
    function FraccionadoService($http) {
        var service = {};
        var url = './stock-api/fraccionado.php';
        service.getFraccionado = getFraccionado;
        service.getDepositoByID = getDepositoByID;
        service.getDepositoByName = getDepositoByName;
        service.saveDeposito = saveDeposito;
        service.deleteDeposito = deleteDeposito;


        return service;

        function getFraccionado(callback) {
            return $http.post(url,
                {function: 'getFraccionado'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function getDepositoByID(id, callback) {
            getFraccionado(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.deposito_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getDepositoByName(name, callback) {
            getFraccionado(function (data) {
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


        function saveDeposito(deposito, _function, callback) {

            return $http.post(url,
                {function: _function, deposito: JSON.stringify(deposito)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }


        function deleteDeposito(id, callback) {
            return $http.post(url,
                {function: 'deleteDeposito', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

