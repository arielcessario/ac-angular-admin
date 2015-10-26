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
    'nombreapp.nav'
    //'ac-search-panel'
]).
    config(['$routeProvider', function ($routeProvider) {
        //$routeProvider.otherwise({redirectTo: '/'});
    }]).controller('MainCtrl', MainCtrl);


//MainCtrl.$inject = ['acAngularLoginClientService', 'ProductosServiceUtils', 'ProductosService'];
MainCtrl.$inject = [];
//function MainCtrl(acAngularLoginClientService, ProductosServiceUtils, ProductosService){
function MainCtrl(){
    var vm = this;

    vm.logout = logout;

    function logout(){
        //acAngularLoginClientService.logout();
    }


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
        {ref:'#/ofertas',name:'Ofertas'},
        {ref:'#/gastos/0',name:'Gastos'},
        {ref:'#/depositos/0',name:'Depositos'},
        {ref:'#/a_reponer',name:'A Reponer'},
        {ref:'#/trasladar_stock',name:'Mover Mercadería'},
        {ref:'#/consulta_stock',name:'Consulta de Stock'}
    ];
}