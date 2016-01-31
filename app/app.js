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
    'acUtils',
    'acUsuarios',
    'acProductos',
    'acStocks',
    'acSucursales',
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
]).
    config(['$routeProvider', function ($routeProvider) {
        //$routeProvider.otherwise({redirectTo: '/'});
    }]).controller('MainCtrl', MainCtrl);


//MainCtrl.$inject = ['acAngularLoginClientService', 'ProductosServiceUtils', 'ProductosService'];
MainCtrl.$inject = ['ResultadosService', 'CajasService', '$document', '$scope', '$location'];
//function MainCtrl(acAngularLoginClientService, ProductosServiceUtils, ProductosService){
function MainCtrl(ResultadosService, CajasService, $document, $scope, $location){
    var vm = this;

    // Inicializo el motor para gráficos
    google.charts.load('current', {packages: ['corechart', 'bar']});

    vm.sucursal_id = '1';
    vm.logout = logout;
    vm.showSearchPanel = false;
    vm.oldIndexScreen = 0;
    vm.generalSearchTerm = '';


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

    function generalSearchPanel(){
        vm.showSearchPanel = !vm.showSearchPanel;
        $scope.$apply();
        if(vm.showSearchPanel){
            var elem = document.getElementById('inputSearchPanel');
            elem.focus();
        }


    }

    function goToScreenList(event){
        var elem = document.getElementById('resultSearchScreen');
        if(event.keyCode == 40){
            elem.focus();
        }

    }

    function moveInScreenList(event){
        var elem = document.getElementById('resultSearchScreen');
        vm.oldIndexScreen = elem.selectedIndex;


        if(event.keyCode == 38 && elem.selectedIndex == 0 && vm.oldIndexScreen == 0){
            var inputElem = document.getElementById('inputSearchPanel');
            inputElem.focus();
        }

        if(event.keyCode == 13){
            vm.showSearchPanel = false;
            vm.generalSearchTerm = '';
            $location.path(elem.options[elem.selectedIndex].value.replace("#","").replace("%23",""));
        }

    }


    function selectScreen(screen){
        vm.showSearchPanel = false;
        vm.generalSearchTerm = '';
        $location.path(screen.replace("#","").replace("%23",""));
    }



    function logout(){
        //acAngularLoginClientService.logout();
    }

    CajasService.getTotalByCuenta('1.1.1.3' + vm.sucursal_id, function(data){
        //console.log(data);
    });


    ResultadosService.saveResultados(function(data){
        //console.log(data);
    });


    //ProductosServiceUtils.clearCache = true;
    //ProductosService.getProductos(function(data){});



    vm.data = [
        {ref:'#/cajas/0',name:'Caja'},
        //{ref:'#/servicios',name:'Servicios'},
        {ref:'#/abrir_cerrar_caja',name:'Apertura/Cierre de Caja'},
        {ref:'#/resumen_caja_diaria',name:'Resumen de Caja Diaria'},
        {ref:'#/historico_caja_diaria',name:'Histórico de Cajas Diarias'},
        {ref:'#/movimientos',name:'Movimientos'},
        {ref:'#/total_concepto',name:'Total por Concepto'},
        {ref:'#/margenes',name:'Margenes'},
        {ref:'#/listado_productos',name:'Lista de Productos'},
        {ref:'#/listado_pedidos',name:'Lista de Pedidos'},
        {ref:'#/listado_categorias',name:'Lista de Categorias'},
        {ref:'#/listado_sucursales',name:'Lista de Sucursales'},
        {ref:'#/listado_usuarios',name:'Lista de Usuarios'},
        {ref:'#/listado_deudores',name:'Lista de Deudores'},
        {ref:'#/listado_ventas_web',name:'Lista de Ventas Web'},
        {ref:'#/usuarios/0',name:'Nuevo Usuario'},
        {ref:'#/productos/0',name:'Nuevo Producto'},
        {ref:'#/pedidos/0',name:'Nuevo Pedido'},
        {ref:'#/proveedores/0',name:'Nuevo Proveedor'},
        {ref:'#/categorias/0',name:'Nueva Categoria'},
        {ref:'#/sucursal/0',name:'Nueva Sucursal'},
        {ref:'#/gastos/0',name:'Gastos'},
        {ref:'#/depositos/0',name:'Depositos'},
        {ref:'#/a_reponer',name:'A Reponer'},
        {ref:'#/trasladar_stock',name:'Mover Mercadería'},
        {ref:'#/fraccionado',name:'Fraccionado'},
        {ref:'#/consulta_stock',name:'Consulta de Stock'},
        {ref:'#/reportes/0',name:'Reportes'}
    ];
}