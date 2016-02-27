(function () {

    'use strict';
    window.conProductos = true;
    window.appName = 'bayres';

// Declare app level module which depends on views, and components
    angular.module('myApp', [
        'ngRoute',
        'ngCookies',
        'ngAnimate',
        'smart-table',
        'acAngularLoginClient',
        'acAngularWaiting',
        'angular-storage',
        'angular-jwt',
        'auth0',
        'acUtils',
        'acUsuarios',
        'acProductos',
        'acStocks',
        'acSucursales',
        'acContacts',
        'slider.manager',
        'nombreapp.stock.login',
        'nombreapp.stock.productos',
        'nombreapp.stock.listadoProductos',
        'nombreapp.stock.pagoProveedores',
        'appname.stock.pedidos',
        'nombreapp.stock.listadoPedidos',
        'nombreapp.stock.consultaStock',
        'nombreapp.stock.proveedores',
        'nombreapp.stock.aReponer',
        'nombreapp.stock.categorias',
        'nombreapp.stock.listadoCategorias',
        'nombreapp.stock.cajas',
        'nombreapp.stock.usuarios',
        'nombreapp.stock.listadoUsuarios',
        'nombreapp.stock.gastos',
        'nombreapp.stock.depositos',
        'nombreapp.stock.resumenCajaDiaria',
        'nombreapp.stock.historicoCajaDiaria',
        'nombreapp.stock.movimientos',
        'nombreapp.stock.resultados',
        'nombreapp.stock.totalConcepto',
        'nombreapp.stock.abrirCerrarCaja',
        'nombreapp.stock.nacionalidades',
        //'nombreapp.stock.servicios',
        'nombreapp.stock.listadoDeudores',
        'nombreapp.stock.ventasWeb',
        'nombreapp.stock.listadoVentasWeb',
        'nombreapp.stock.ofertas',
        'nombreapp.stock.detalleDeudores',
        'nombreapp.stock.cancelarDeuda',
        'nombreapp.stock.listadoProveedores',
        'nombreapp.stock.trasladarStock',
        'nombreapp.stock.noticias',
        'nombreapp.stock.listadoNoticias',
        'nombreapp.stock.comentarios',
        'nombreapp.stock.sucursales',
        'nombreapp.stock.listadoSucursales',
        'nombreapp.stock.fraccionado',
        'nombreapp.stock.reportes',
        'nombreapp.nav'
        //'ac-search-panel'
    ]).config(['$routeProvider', function ($routeProvider) {
        //$routeProvider.otherwise({redirectTo: '/'});
    }]).controller('MainCtrl', MainCtrl);


//MainCtrl.$inject = ['acAngularLoginClientService', 'ProductosServiceUtils', 'ProductosService'];
    MainCtrl.$inject = ['ResultadosService', 'CajasService', '$document', '$scope', '$location', 'UserVars', 'UserService',
        '$cookieStore', 'AcUtilsGlobals'];
//function MainCtrl(acAngularLoginClientService, ProductosServiceUtils, ProductosService){
    function MainCtrl(ResultadosService, CajasService, $document, $scope, $location, UserVars, UserService,
                      $cookieStore, AcUtilsGlobals) {
        var vm = this;

        // Inicializo el motor para gráficos
        google.charts.load('current', {packages: ['corechart', 'bar']});

        vm.sucursal_id = '1';
        vm.logout = logout;
        vm.showSearchPanel = false;
        vm.oldIndexScreen = 0;
        vm.generalSearchTerm = '';
        vm.user = UserService.getFromToken();
        UserVars.loginPath = '/login';


        vm.goToScreenList = goToScreenList;
        vm.selectScreen = selectScreen;
        vm.moveInScreenList = moveInScreenList;


        // TODO: Agregar scape para que lo oculte
        var map = {17: false, 18: false, 66: false};
        $document.bind('keydown', function (e) {
            if (e.keyCode in map) {
                map[e.keyCode] = true;
                if (map[17] && map[18] && map[66]) {
                    //save();
                    generalSearchPanel();
                }
            }
        });
        $document.bind('keyup', function (e) {
            if (e.keyCode in map) {
                map[e.keyCode] = false;
            }
        });

        function generalSearchPanel() {
            vm.showSearchPanel = !vm.showSearchPanel;
            $scope.$apply();
            if (vm.showSearchPanel) {
                var elem = document.getElementById('inputSearchPanel');
                elem.focus();
            }


        }

        function goToScreenList(event) {
            var elem = document.getElementById('resultSearchScreen');
            if (event.keyCode == 40) {
                elem.focus();
            }

        }

        function moveInScreenList(event) {
            var elem = document.getElementById('resultSearchScreen');
            vm.oldIndexScreen = elem.selectedIndex;


            if (event.keyCode == 38 && elem.selectedIndex == 0 && vm.oldIndexScreen == 0) {
                var inputElem = document.getElementById('inputSearchPanel');
                inputElem.focus();
            }

            if (event.keyCode == 13) {
                vm.showSearchPanel = false;
                vm.generalSearchTerm = '';
                $location.path(elem.options[elem.selectedIndex].value.replace("#", "").replace("%23", ""));
            }

        }


        function selectScreen(screen) {
            vm.showSearchPanel = false;
            vm.generalSearchTerm = '';
            $location.path(screen.replace("#", "").replace("%23", ""));
        }


        function logout() {
            $cookieStore.remove('pos');
            UserService.logout();
            $location.path('/login');
        }

        CajasService.getTotalByCuenta('1.1.1.3' + vm.sucursal_id, function (data) {
            //console.log(data);
        });


        //ResultadosService.saveResultados(function (data) {
        //    //console.log(data);
        //});


        //ProductosServiceUtils.clearCache = true;
        //ProductosService.getProductos(function(data){});


        if (UserService.getFromToken() == false) {
            vm.data = [];
        } else {
            generateMenu();
        }

        vm.login = function (mail, password, sucursal, pos) {
            UserService.login(mail, password, sucursal.sucursal_id, function (data) {

                if (data instanceof Object) {
                    $location.path('/');
                    vm.user = UserService.getFromToken();
                    $cookieStore.put('pos', pos);
                    $cookieStore.put('sucursal', sucursal);
                    generateMenu();
                } else {
                    $location.path('/login');
                    vm.data = [];
                }
            });
        };


        function generateMenu() {
            var menu = [
                {ref: '#/cajas/0', name: 'Caja', rol: 1},
                //{ref:'#/servicios',name:'Servicios'},
                {ref: '#/abrir_cerrar_caja', name: 'Apertura/Cierre de Caja', rol: 0},
                {ref: '#/resumen_caja_diaria', name: 'Resumen de Caja Diaria', rol: 0},
                {ref: '#/historico_caja_diaria', name: 'Histórico de Cajas Diarias', rol: 0},
                {ref: '#/movimientos', name: 'Movimientos', rol: 0},
                {ref: '#/total_concepto', name: 'Total por Concepto', rol: 0},
                {ref: '#/margenes', name: 'Margenes', rol: 0},
                {ref: '#/listado_productos', name: 'Lista de Productos', rol: 0},
                {ref: '#/listado_pedidos', name: 'Lista de Pedidos', rol: 0},
                {ref: '#/listado_categorias', name: 'Lista de Categorias', rol: 0},
                {ref: '#/listado_sucursales', name: 'Lista de Sucursales', rol: 0},
                {ref: '#/listado_usuarios', name: 'Lista de Usuarios', rol: 0},
                {ref: '#/listado_deudores', name: 'Lista de Deudores', rol: 0},
                {ref: '#/listado_ventas_web', name: 'Lista de Ventas Web', rol: 0},
                {ref: '#/usuarios/0', name: 'Nuevo Usuario', rol: 0},
                {ref: '#/productos/0', name: 'Nuevo Producto', rol: 0},
                {ref: '#/pedidos/0', name: 'Nuevo Pedido', rol: 0},
                {ref: '#/proveedores/0', name: 'Nuevo Proveedor', rol: 0},
                {ref: '#/categorias/0', name: 'Nueva Categoria', rol: 0},
                {ref: '#/sucursal/0', name: 'Nueva Sucursal', rol: 0},
                {ref: '#/gastos/0', name: 'Gastos', rol: 0},
                {ref: '#/depositos/0', name: 'Depositos', rol: 0},
                {ref: '#/a_reponer', name: 'A Reponer', rol: 0},
                {ref: '#/trasladar_stock', name: 'Mover Mercadería', rol: 0},
                {ref: '#/fraccionado', name: 'Fraccionado', rol: 0},
                {ref: '#/consulta_stock', name: 'Consulta de Stock', rol: 0},
                {ref: '#/reportes/0', name: 'Reportes', rol: 0}
            ];

            var rol = parseInt(vm.user.data.rol);
            var filtrados = [];

            for (var i = 0; i < menu.length; i++) {
                if (menu[i].rol >= rol) {
                    filtrados.push(menu[i]);
                }
            }
            vm.data = filtrados;

            if($cookieStore.get('sucursal') == undefined){
                logout();
            }else{
                AcUtilsGlobals.sucursal_id = ($cookieStore.get('sucursal')).sucursal_id;
                AcUtilsGlobals.pos_id = ($cookieStore.get('pos')).id;
                AcUtilsGlobals.user_id = vm.user.data.id;
                AcUtilsGlobals.rol_id = vm.user.data.rol;
            }




        }


    }
})();

