(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('nombreapp.stock.servicios', ['ngRoute', 'nombreapp.stock.clientes', 'nombreapp.stock.cajas', 'toastr'
        , 'acMovimientos', 'acAngularLoginClient'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/servicios', {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: 'ServiciosController'
            });
        }])
        .controller('ServiciosController', ServiciosController);


    ServiciosController.$inject = ['$routeParams', 'CajasService', 'toastr', '$location', '$window',
        'UserService', 'MovimientosService', 'acAngularLoginClientService'];
    function ServiciosController($routeParams, CajasService, toastr, $location, $window, UserService,
                                 MovimientosService, acAngularLoginClientService) {

        acAngularLoginClientService.checkCookie();

        var vm = this;
        vm.isUpdate = false;
        vm.tipo_precio = 0;
        vm.fn_clientes = UserService.getClienteByName;
        vm.cliente = {};
        vm.detalle = {};
        vm.detalles = [];
        vm.total = 0.0;
        vm.forma_pago = '01';
        vm.desc_porc = 0;
        vm.desc_cant = 0;
        vm.a_cobrar = 0;
        vm.paga_con = 0;
        vm.vuelto = 0;
        vm.descripcion = '';


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
            MovimientosService.armarMovimiento('004', '00', 1, '07', '00', vm.total, vm.desc_cant, 'Venta Productos - Ingreso a Deudores', vm.detalles, vm.cliente.cliente_id, 1, '',
                function (data) {
                    toastr.success('Venta realizada con éxito.');

                    console.log(data);
                });
        }

        function save() {

            if (vm.detalles.length < 1) {
                toastr.error('No hay productos seleccionados');
                return;
            }
            var cliente_id = -1;
            if (vm.cliente.cliente_id !== undefined) {
                cliente_id = vm.cliente.cliente_id;
            }
            //(tipo_asiento, subtipo_asiento, sucursal_id, forma_pago, transferencia_desde, total, descuento, detalle, items, cliente_id, usuario_id, comentario, callback)
            MovimientosService.armarMovimiento('004', '00', 1, vm.forma_pago, '00', vm.total, vm.desc_cant, 'Venta de Servicio', vm.detalles, cliente_id, 1, '',
                function (data) {
                    toastr.success('Venta realizada con éxito.');

                    console.log(data);
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
                    vm.total = parseFloat(vm.total) + parseFloat(vm.detalles[i].importe);
                }
            }

            calc_a_cobrar('cant')
        }

        function agregarDetalle() {
            var sucursal_id = 1;

            if (vm.servicio.descripcion === undefined || vm.servicio.descripcion == '') {
                toastr.error('Debe seleccionar un producto');
                return;
            }

            if (vm.servicio.importe === undefined || vm.servicio.importe == '') {
                toastr.error('Debe ingresar un importe');
                return;
            }
            vm.detalle = {
                descripcion: vm.servicio.descripcion,
                importe: vm.servicio.importe
            };
            vm.detalles.push(vm.detalle);


            //console.log(vm.detalles);

            vm.servicio.descripcion = '';
            vm.servicio.importe = '';
            vm.detalle = {};
            calcularTotal();
            var elem = document.getElementById('descripcion');
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


})();