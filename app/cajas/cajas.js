(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('nombreapp.stock.cajas', ['ngRoute', 'nombreapp.stock.productos', 'nombreapp.stock.clientes', 'toastr'
        , 'acMovimientos', 'nombreapp.stock.consultaStock'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/cajas', {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: 'CajasController'
            });
        }])
        .controller('CajasController', CajasController)
        .service('CajasService', CajasService);


    CajasController.$inject = ['$routeParams', 'ProductosService', 'CajasService', 'toastr', '$location', '$window',
        'ClientesService', 'MovimientosService', 'MovimientoStockFinal', 'ConsultaStockService'];
    function CajasController($routeParams, ProductosService, CajasService, toastr, $location, $window, ClientesService,
                             MovimientosService, MovimientoStockFinal, ConsultaStockService) {

        var vm = this;
        vm.isUpdate = false;
        vm.tipo_precio = 0;
        vm.fn_clientes = ClientesService.getClienteByName;
        vm.fn_productos = ProductosService.getProductoByName;
        vm.fn_productos_sku = ProductosService.getProductoByNameOrSKU;
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


        vm.agregarDetalle = agregarDetalle;
        vm.removeDetalle = removeDetalle;
        vm.agregarMP = agregarMP;
        vm.calc_a_cobrar = calc_a_cobrar;
        vm.save = save;
        vm.aCuenta = aCuenta;

        function aCuenta() {
            //console.log(vm.cliente.cliente_id);
            if (vm.cliente === undefined || vm.cliente.cliente_id === undefined || vm.cliente === {}) {
                toastr.error('Debe seleccionar un cliente');
                return;
            }

            if (vm.detalles.length < 1) {
                toastr.error('No hay productos seleccionados');
                return;
            }

            //(tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, cliente_id, usuario_id, comentario, callback)
            MovimientosService.armarMovimiento('001', '00', 1, '07', '00', vm.total, vm.desc_cant, 'Venta Productos - Ingreso a Deudores', vm.detalles, vm.cliente.cliente_id, 1, '',
                function (data) {
                    //console.log(MovimientoStockFinal.stocks_finales);
                    ConsultaStockService.updateStock(MovimientoStockFinal.stocks_finales, function (data) {
                        toastr.success('Venta realizada con éxito.');

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
            var cliente_id = -1;
            if(vm.cliente.cliente_id !== undefined){
                cliente_id = vm.cliente.cliente_id;
            }
            //(tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, cliente_id, usuario_id, comentario, callback)
            MovimientosService.armarMovimiento('001', '00', 1, vm.forma_pago, '00', vm.total, vm.desc_cant, 'Venta de Caja', vm.detalles, cliente_id, 1, '',
                function (data) {
                    //console.log(MovimientoStockFinal.stocks_finales);
                    ConsultaStockService.updateStock(MovimientoStockFinal.stocks_finales, function (data) {
                        toastr.success('Venta realizada con éxito.');

                        console.log(data);
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

        function quitarMP(index) {
            var indice = -1;
            for (var i = 0; i < vm.list_mp.length; i++) {
                if (index == vm.list_mp[i]) {
                    indice = i;
                }
            }

            if (indice > -1) {
                vm.list_mp.splice(indice, 1);
            }
            calcularTotal();
        }

        function agregarMP(detalle) {

            detalle.mp = !detalle.mp;
            calcularTotal();

        }

        function calcularTotal() {

            vm.total = 0.0;

            for (var i = 0; i < vm.detalles.length; i++) {
                if (!vm.detalles[i].mp) {
                    vm.total = parseFloat(vm.total) + parseFloat(vm.detalles[i].precio_total);
                }
            }

            calc_a_cobrar('cant')
        }

        function agregarDetalle() {
            var sucursal_id = 1;

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

            var stockSucursal = 0;
            for (var i = 0; i < vm.producto.stocks.length; i++) {
                if (vm.producto.stocks[i].sucursal_id == sucursal_id) {
                    stockSucursal = stockSucursal + parseInt(vm.producto.stocks[i].cant_actual);
                }

            }
            if (stockSucursal == 0) {
                toastr.error('No hay stock suficiente.');
                return;
            }

            if (stockSucursal < vm.cantidad) {
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


            if (!encontrado) {
                vm.detalle = {
                    producto_id: vm.producto.producto_id,
                    sku: vm.producto.sku,
                    producto_nombre: vm.producto.nombre,
                    cantidad: vm.cantidad,
                    precio_unidad: vm.producto.precios[vm.tipo_precio].precio,
                    precio_total: parseInt(vm.cantidad) * parseFloat(vm.producto.precios[vm.tipo_precio].precio),
                    stock: vm.producto.stocks,
                    mp: false
                };
                vm.detalles.push(vm.detalle);
            }


            //console.log(vm.detalles);

            vm.producto.producto_id = '';
            vm.producto.nombre = '';
            vm.cantidad = '';
            vm.producto.precios[vm.tipo_precio].precio = '';
            vm.producto = {};
            vm.detalle = {};
            calcularTotal();
            var elem = document.getElementById('input02');
            elem.focus();
            elem.value = null;
        }

        function removeDetalle(index) {
            var r = confirm('Realmente desea eliminar el producto del pedido?');
            if (r) {
                //vm.total = parseFloat(vm.total) - parseFloat(vm.detalles[index].precio_total);
                vm.detalles.splice(index, 1);
                quitarMP(index);
            }

            //calcularTotal;
        }

    }

    CajasService.$inject = ['$http'];
    function CajasService($http) {
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
        return service;

        function totalConcepto(where, fecha_desde, fecha_hasta, callback){
            return $http.get(url + '?function=totalConcepto&where='+where+'&fecha_desde=' + fecha_desde +'&fecha_hasta='+fecha_hasta)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }


        function getMovimientos(fecha_desde, fecha_hasta, callback){
            return $http.get(url + '?function=getMovimientos&fecha_desde=' + fecha_desde +'&fecha_hasta='+fecha_hasta)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }


        function getCajaDiariaFromTo(sucursal_id, asiento_id_inicio, asiento_id_fin, callback){
            return $http.get(url + '?function=getCajaDiariaFromTo&sucursal_id=' + sucursal_id +'&asiento_id_inicio='+asiento_id_inicio+'&asiento_id_fin='+asiento_id_fin)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function getCajas(callback){
            return $http.get(url + '?function=getCajas', {cache:true})
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function getCajasBySucursal(sucursal_id, callback){
            getCajas(function(data){
               var response = data.filter(function(elem, index, array){
                   return elem.sucursal_id == sucursal_id;
               });

                callback(response);
            });

        }

        function getCajaDiaria(sucursal_id, callback) {
            return $http.get(url + '?function=getCajaDiaria&sucursal_id=' + sucursal_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });

        }

        function getHistoricoCajaDiaria(sucursal_id, callback) {
            //return $http.post();

        }

        function getSaldoFinal(sucursal_id, callback) {
            return $http.post(url, {function:'getSaldoFinal',sucursal_id: sucursal_id})
                .success(function(data){
                    callback(data);
                })
                .error(function(data){
                    callback(data);
                });

        }

        function cerrarCaja(sucursal_id, importe, callback) {
            return $http.post(url, {function:'cerrarCaja', sucursal_id: sucursal_id, importe: importe})
                .success(function(data){
                    callback(data);
                })
                .error(function(data){
                    callback(data);
                });

        }

        function abrirCaja(sucursal_id, importe, callback) {
            return $http.post(url, {function:'abrirCaja', sucursal_id: sucursal_id, importe: importe})
                .success(function(data){
                    callback(data);
                })
                .error(function(data){
                    callback(data);
                });

        }

        function getSaldoInicial(sucursal_id, callback){
            return $http.get(url + '?function=getSaldoInicial&sucursal_id='+sucursal_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function getSaldoFinalAnterior(sucursal_id, callback){
            return $http.get(url + '?function=getSaldoFinalAnterior&sucursal_id='+sucursal_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

        function checkEstado(sucursal_id, callback){
            return $http.get(url + '?function=checkEstado&sucursal_id='+sucursal_id)
                .success(function (data) {
                    callback(data)
                })
                .error(function (data) {
                    callback(data)
                });
        }

    }
})();