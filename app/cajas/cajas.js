(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('nombreapp.stock.cajas', ['ngRoute'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/cajas/:id', {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: 'CajasController',
                data: {requiresLogin: true}
            });
        }])
        .controller('CajasController', CajasController)
        .factory('CajasService', CajasService)
        .service('CajasVars', CajasVars);


    CajasController.$inject = ['$routeParams', 'ProductService', 'CajasService', 'toastr',
        'UserService', 'MovimientosService', 'MovimientoStockFinal', 'ConsultaStockService',
        'AcUtils', 'AcUtilsGlobals', '$rootScope', 'ProductVars', 'StockService', 'StockVars', '$scope',
        '$document'];
    function CajasController($routeParams, ProductService, CajasService, toastr,
                             UserService, MovimientosService, MovimientoStockFinal, ConsultaStockService,
                             AcUtils, AcUtilsGlobals, $rootScope, ProductVars, StockService, StockVars, $scope,
                             $document) {


        var vm = this;
        vm.isUpdate = false;
        vm.tipo_precio = '0';
        vm.cliente = {};
        vm.producto = {};
        vm.detalle = {};
        vm.detalles = [];
        vm.total = 0.0;
        vm.list_mp = [];
        vm.forma_pago = '01';
        vm.desc_porc = 0;
        vm.desc_cant = 0;
        vm.a_cobrar = 0;
        vm.paga_con = 0;
        vm.vuelto = 0;
        vm.id = $routeParams.id;
        vm.usuario_id = -1;
        vm.searchProductText = '';
        vm.listaProductos = [];


        StockVars.reducido = true;

        vm.agregarDetalle = agregarDetalle;
        vm.removeDetalle = removeDetalle;
        vm.calc_a_cobrar = calc_a_cobrar;
        vm.save = save;
        vm.aCuenta = aCuenta;
        vm.calcularTotal = calcularTotal;
        vm.moveInProductSearch = moveInProductSearch;
        var oldIndex = 0;
        var selecciona = false;

        //vm.sucursal_id = 1;

        var elemCaja = angular.element(document.querySelector('#screen-caja'));

        $scope.$on('$locationChangeStart', function () {

            elemCaja.unbind('keydown');
            elemCaja.unbind('keyup');
        });


        var map = {17: false, 18: false, 80: false};
        elemCaja.bind('keydown', function (e) {
            if (e.keyCode in map) {
                map[e.keyCode] = true;
                if (map[17] && map[18] && map[80]) {
                    save();
                }
            }
        });
        elemCaja.bind('keyup', function (e) {
            if (e.keyCode in map) {
                map[e.keyCode] = false;
            }
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

                oldIndex = vm.listaProductos.indexOf(vm.producto);
            } else {
                // Flecha para arriba
                if (event.keyCode == 38) {
                    if (vm.listaProductos.indexOf(vm.producto) == 0 && oldIndex == 0) {
                        var elem = angular.element(document.querySelector('#txtSearchId'));
                        elem[0].focus();
                    }
                    oldIndex = vm.listaProductos.indexOf(vm.producto);

                }

                if (event.keyCode == 40) {
                    oldIndex = vm.listaProductos.indexOf(vm.producto);
                }

                if (event.keyCode == 13 || event.type == 'click') {
                    selecciona = true;
                    vm.searchProductText = vm.producto.nombreProducto;
                    var elem = angular.element(document.querySelector('#cantidad'));
                    elem[0].focus();

                }
            }

        }

        $scope.$watch('cajasCtrl.searchProductText', function () {

            if (vm.searchProductText.replace(' ', '').length > 0) {

                if (!selecciona) {
                    StockService.getDisponibles(AcUtilsGlobals.sucursal_id, vm.searchProductText, function (data) {
                        vm.listaProductos = data;
                    })
                } else {
                    selecciona = false;
                }
            } else {
                vm.listaProductos = [];
            }

        });
        //
        //if (vm.id != 0) {
        //    CajasService.getAsientoCajaById(vm.id, vm.sucursal_id, function (data) {
        //        for (var i = 0; i < data.length; i++) {
        //            if (data[i].cuenta_id.indexOf('1.1.1.01') > -1) {
        //
        //            } else if (data[i].cuenta_id.indexOf('4.1.1.0') > -1) {
        //                vm.detalle = {};
        //                //for(var x=0; x<data[i].detalles.length; x++){
        //
        //                vm.detalle = {
        //                    producto_id: data[i].detalles[3].detalle.split(' - ')[0],
        //                    sku: '',
        //                    producto_nombre: data[i].detalles[3].detalle.split(' - ')[1],
        //                    cantidad: data[i].detalles[2].detalle,
        //                    precio_unidad: data[i].detalles[1].detalle,
        //                    precio_total: parseInt(data[i].detalles[2].detalle) * parseFloat(data[i].detalles[1].detalle),
        //                    stock: 0,
        //                    mp: false
        //                    //};
        //                };
        //                vm.detalles.push(vm.detalle);
        //            }
        //        }
        //        calcularTotal();
        //        //vm.detalles = data[1].detalles;
        //    });
        //} else {
        //
        //}
        //
        function aCuenta() {
            //console.log(vm.cliente.usuario_id);
            if (vm.cliente == undefined || vm.cliente.usuario_id == undefined || vm.cliente.usuario_id < 0) {
                toastr.error('Debe seleccionar un cliente');
                return;
            }

            if (vm.detalles.length < 1) {
                toastr.error('No hay productos seleccionados');
                return;
            }

            //(tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, usuario_id, usuario_id, comentario, callback)
            MovimientosService.armarMovimiento('001', '00', AcUtilsGlobals.sucursal_id, AcUtilsGlobals.pos_id, '07', '00', vm.total, vm.desc_cant, 'Venta Productos - Ingreso a Deudores', vm.detalles, vm.cliente.usuario_id, 1, '',
                function (data) {
                    //console.log(MovimientoStockFinal.stocks_finales);
                    ConsultaStockService.updateStock(MovimientoStockFinal.stocks_finales, function (data) {

                        vm.cliente.saldo =  vm.cliente.saldo - parseFloat(vm.total);
                        UserService.update(vm.cliente, function (data) {
                            if (!isNaN(data) && data > -1) {
                                vm.detalles = [];
                                vm.cliente = {};

                                vm.forma_pago = '01';
                                vm.desc_porc = 0;
                                vm.desc_cant = 0;
                                vm.a_cobrar = 0;
                                vm.paga_con = 0;
                                vm.vuelto = 0;
                                vm.total = 0;
                                toastr.success('Venta realizada con éxito.');
                            } else {
                                toastr.error('Error al realizar la venta');
                            }

                        });


                        //console.log(data);
                    });
                    //console.log(data);
                });
        }

        function save() {

            if (vm.detalles.length < 1) {
                toastr.error('No hay productos seleccionados');
                return;
            }

            AcUtilsGlobals.isWaiting = true;
            $rootScope.$broadcast('IsWaiting');
            //var usuario_id = -1;
            if (vm.cliente !== undefined && vm.cliente.usuario_id !== undefined) {
                vm.usuario_id = vm.cliente.usuario_id;
            } else {
                if (vm.cliente.nombre !== '') {
                    if (AcUtils.validateEmail(vm.cliente.nombre)) {
                        vm.cliente = {
                            nombre: '',
                            apellido: '',
                            mail: vm.cliente.nombre,
                            nacionalidad_id: '',
                            tipo_doc: 0,
                            nro_doc: '',
                            comentarios: '',
                            marcado: 0,
                            fecha_nacimiento: ''
                        };
                        UserService.create(vm.cliente, function (data) {
                            vm.usuario_id = data;
                            finalizarVenta();
                        });
                    }
                } else {
                    finalizarVenta();
                }

            }
            finalizarVenta();


        }

        function finalizarVenta() {
            //return;
            //(tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, usuario_id, usuario_id, comentario, callback)
            MovimientosService.armarMovimiento('001', '00', AcUtilsGlobals.sucursal_id, AcUtilsGlobals.pos_id, vm.forma_pago, '00', vm.total, vm.desc_cant, 'Venta de Caja', vm.detalles, vm.usuario_id, 1, '',
                function (data) {
                    //console.log(MovimientoStockFinal.stocks_finales);
                    ConsultaStockService.updateStock(MovimientoStockFinal.stocks_finales, function (data) {
                        toastr.success('Venta realizada con éxito.');
                        vm.detalles = [];
                        vm.cliente = {};

                        vm.forma_pago = '01';
                        vm.desc_porc = 0;
                        vm.desc_cant = 0;
                        vm.a_cobrar = 0;
                        vm.paga_con = 0;
                        vm.vuelto = 0;
                        vm.total = 0;

                        ProductVars.clearCache = true;
                        ProductService.get(function (data) {
                        });

                        StockVars.clearCache = true;
                        StockService.get(function (data) {

                        });

                        AcUtilsGlobals.isWaiting = false;
                        $rootScope.$broadcast('IsWaiting');
                    });
                    //console.log(data);
                });
        }


        function calc_a_cobrar(origen) {

            if (vm.desc_cant === null) {
                vm.desc_cant = 0;
            }
            if (vm.desc_porc === null) {
                vm.desc_porc = 0;
            }

            if (origen === 'porc') {
                if (vm.desc_porc > 0) {
                    vm.a_cobrar = vm.total - (vm.total * vm.desc_porc) / 100;
                    vm.desc_cant = vm.total - vm.a_cobrar;
                } else {
                    vm.a_cobrar = vm.total;
                    vm.desc_cant = 0;
                }
            } else {

                if (vm.desc_cant > 0) {
                    vm.a_cobrar = vm.total - vm.desc_cant;
                    vm.desc_porc = (vm.desc_cant * 100) / vm.total;
                } else {
                    vm.a_cobrar = vm.total;
                    vm.desc_porc = 0;
                }
            }

            vm.vuelto = (vm.paga_con > 0 && vm.paga_con !== null) ? vm.a_cobrar - vm.paga_con : 0;

        }

        //
        //function quitarMP(index) {
        //    var indice = -1;
        //    for (var i = 0; i < vm.list_mp.length; i++) {
        //        if (index == vm.list_mp[i]) {
        //            indice = i;
        //        }
        //    }
        //
        //    if (indice > -1) {
        //        vm.list_mp.splice(indice, 1);
        //    }
        //    calcularTotal();
        //}
        //
        //function agregarMP(detalle) {
        //
        //    detalle.mp = !detalle.mp;
        //    calcularTotal();
        //
        //}
        //
        function calcularTotal() {

            vm.total = 0.0;


            if (vm.forma_pago == '08' ||
                vm.forma_pago == '09' ||
                vm.forma_pago == '10') {


                for (var i = 0; i < vm.detalles.length; i++) {
                    vm.total = parseFloat(vm.total) + parseFloat(vm.detalles[i].precio_total);
                    vm.detalles[i].precio_unidad = Math.round((parseFloat(vm.detalles[i].precio_total) / vm.detalles[i].cantidad) * 100) / 100;
                }

            } else {

                for (var i = 0; i < vm.detalles.length; i++) {
                    if (!vm.detalles[i].mp) {
                        vm.total = parseFloat(vm.total) + parseFloat(vm.detalles[i].precio_total);
                    }
                }

            }
            calc_a_cobrar('cant');
        }

        function agregarDetalle() {
            var sucursal_id = 1;
            var stockSucursal = vm.producto.cant_actual;

            if (vm.producto.producto_id === undefined || vm.producto.producto_id == -1
                || vm.producto.producto_id == '') {
                toastr.error('Debe seleccionar un producto');
                return;
            }

            if (vm.producto.producto_id === undefined || vm.producto.producto_id == -1
                || vm.producto.producto_id == '') {
                toastr.error('Debe seleccionar un producto');
                return;
            }

            if (vm.cantidad === undefined || vm.cantidad == 0
                || isNaN(vm.cantidad)) {
                toastr.error('Debe ingresar una cantidad');
                return;
            }


            if (vm.producto.cant_actual == 0) {
                toastr.error('No hay stock suficiente.');
                return;
            }

            //console.log(vm.producto.cant_actual);

            if (vm.producto.producto_tipo == 0 && vm.producto.cant_actual < vm.cantidad) {
                toastr.error('No hay stock suficiente. Solo quedan ' + stockSucursal + ' productos.');
                return;
            }


            var encontrado = false;
            for (var i = 0; i < vm.detalles.length; i++) {
                if (vm.producto.producto_id == vm.detalles[i].producto_id) {

                    if (stockSucursal < parseInt(vm.detalles[i].cantidad) + parseInt(vm.cantidad)) {
                        toastr.error('No hay stock suficiente. Solo quedan ' + stockSucursal + ' productos.');
                        return;
                    }


                    vm.detalles[i].cantidad = parseInt(vm.detalles[i].cantidad) + parseInt(vm.cantidad);
                    vm.detalles[i].precio_total = parseInt(vm.detalles[i].cantidad) * parseFloat(vm.detalles[i].precio_unidad);


                    encontrado = true;
                }
            }

            var prod = angular.copy(vm.producto);
            if (!encontrado) {
                vm.detalle = {
                    producto_id: prod.producto_id,
                    sku: prod.sku,
                    producto_nombre: prod.nombreProducto,
                    cantidad: vm.cantidad,
                    precio_unidad: prod.precios[vm.tipo_precio].precio,
                    precio_total: parseInt(vm.cantidad) * parseFloat(prod.precios[vm.tipo_precio].precio),
                    stock: prod.stock,
                    productos_kit: prod.kits,
                    mp: false
                };
                //console.log(vm.detalle);
                vm.detalles.push(vm.detalle);
            }


            //console.log(vm.detalles);

            vm.producto = {};
            vm.cantidad = undefined;
            calcularTotal();
            var elem = angular.element(document.querySelector('#txtSearchId'));
            elem[0].focus();
            vm.searchProductText = '';
            vm.listaProductos = [];
            //var elem = document.getElementById('producto-search');
            //elem.focus();
            elem.value = '';
        }

        function removeDetalle(index) {
            var r = confirm('Realmente desea eliminar el producto del pedido?');
            if (r) {
                //vm.total = parseFloat(vm.total) - parseFloat(vm.detalles[index].precio_total);
                vm.detalles.splice(index, 1);
                //quitarMP(index);
            }

            calcularTotal();
        }

    }

    CajasService.$inject = ['$http', '$cacheFactory', 'CajasVars'];
    function CajasService($http, $cacheFactory, CajasVars) {
        var service = {};
        var url = './stock-api/cajas.php';
        // Cajas diarias siempre por sucursal
        service.getCajaDiaria = getCajaDiaria;
        service.getHistoricoCajaDiaria = getHistoricoCajaDiaria;
        service.getSaldoInicial = getSaldoInicial;
        service.getCajas = getCajas;
        service.getCajaDiariaFromTo = getCajaDiariaFromTo;
        service.getCajasBySucursal = getCajasBySucursal;
        service.getMovimientos = getMovimientos;
        service.totalConcepto = totalConcepto;
        service.checkEstado = checkEstado;
        service.getSaldoFinal = getSaldoFinal;
        service.getSaldoFinalAnterior = getSaldoFinalAnterior;
        service.cerrarCaja = cerrarCaja;
        service.abrirCaja = abrirCaja;
        service.getAsientoCajaById = getAsientoCajaById;
        service.getTotalByCuenta = getTotalByCuenta;
        service.getDetalleByCuenta = getDetalleByCuenta;
        return service;

        function getTotalByCuenta(cuenta, callback) {
            var urlGet = url + '?function=getTotalByCuenta&cuenta_id=' + cuenta;
            var $httpDefaultCache = $cacheFactory.get('$http');
            var cachedData = [];


            // Verifica si existe el cache de productos
            if ($httpDefaultCache.get(urlGet) != undefined) {
                if (CajasVars.clearCache) {
                    $httpDefaultCache.remove(urlGet);
                }
                else {
                    cachedData = $httpDefaultCache.get(urlGet);
                    callback(cachedData);
                    return;
                }
            }


            return $http.get(urlGet, {cache: true})
                .success(function (data) {
                    $httpDefaultCache.put(urlGet, data);
                    CajasVars.getTotalByCuenta.clearCache = false;
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                    CajasVars.getTotalByCuenta.clearCache = false;
                })

        }

        function getDetalleByCuenta(cuenta) {

        }


        function totalConcepto(where, fecha_desde, fecha_hasta, callback) {
            return $http.get(url + '?function=totalConcepto&where=' + where + '&fecha_desde=' + fecha_desde + '&fecha_hasta=' + fecha_hasta)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }


        function getMovimientos(fecha_desde, fecha_hasta, callback) {
            return $http.get(url + '?function=getMovimientos&fecha_desde=' + fecha_desde + '&fecha_hasta=' + fecha_hasta)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }


        function getCajaDiariaFromTo(sucursal_id, pos_id, asiento_id_inicio, asiento_id_fin, callback) {
            return $http.get(url + '?function=getCajaDiariaFromTo&sucursal_id=' + sucursal_id + '&asiento_id_inicio=' + asiento_id_inicio + '&asiento_id_fin=' + asiento_id_fin + '&pos_id=' + pos_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function getCajas(callback) {
            return $http.get(url + '?function=getCajas', {cache: true})
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function getCajasBySucursal(sucursal_id, pos_id, callback) {
            getCajas(function (data) {
                var response = data.filter(function (elem, index, array) {
                    return elem.sucursal_id == sucursal_id && elem.pos_id == pos_id;
                });

                callback(response);
            });

        }

        function getCajaDiaria(sucursal_id, pos_id, callback) {
            return $http.get(url + '?function=getCajaDiaria&sucursal_id=' + sucursal_id + '&pos_id=' + pos_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });

        }

        function getAsientoCajaById(asiento_id, sucursal_id, pos_id, callback) {
            getCajaDiaria(sucursal_id, pos_id, function (data) {
                var response = data.filter(function (elem, index, array) {
                    return elem.asiento_id == asiento_id;
                });
                callback(response);
            });
        }

        function getHistoricoCajaDiaria(sucursal_id, pos_id, callback) {
            //return $http.post();

        }

        function getSaldoFinal(sucursal_id, pos_id, callback) {
            return $http.post(url, {function: 'getSaldoFinal', sucursal_id: sucursal_id, pos_id: pos_id})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });

        }

        function cerrarCaja(sucursal_id, pos_id, importe, detalles, callback) {
            return $http.post(url, {
                    function: 'cerrarCaja',
                    sucursal_id: sucursal_id,
                    pos_id: pos_id,
                    importe: importe,
                    detalles: detalles
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });

        }

        function abrirCaja(sucursal_id, pos_id, importe, callback) {
            return $http.post(url, {function: 'abrirCaja', sucursal_id: sucursal_id, pos_id: pos_id, importe: importe})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });

        }

        function getSaldoInicial(sucursal_id, pos_id, callback) {
            return $http.get(url + '?function=getSaldoInicial&sucursal_id=' + sucursal_id + '&pos_id=' + pos_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function getSaldoFinalAnterior(sucursal_id, pos_id, callback) {
            return $http.get(url + '?function=getSaldoFinalAnterior&sucursal_id=' + sucursal_id + '&pos_id=' + pos_id)
                .success(function (data) {
                    console.log(data);
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function checkEstado(sucursal_id, pos_id, callback) {
            return $http.get(url + '?function=checkEstado&sucursal_id=' + sucursal_id + '&pos_id=' + pos_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

    }


    CajasVars.$inject = [];
    function CajasVars() {

        // Solo para la funcionalidad de getTotalByCuenta, limpio o no el caché
        this.getTotalByCuenta = {};
        this.getTotalByCuenta.clearCache = true;
    }
})();