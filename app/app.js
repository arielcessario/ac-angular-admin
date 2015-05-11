'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'nombreapp.stock.productos',
    'nombreapp.stock.listadoProductos',
    'appname.stock.pedidos',
    'nombreapp.stock.listadoPedidos',
    'nombreapp.stock.consultaStock',
    'nombreapp.stock.sucursales',
    'nombreapp.stock.proveedores',
    'nombreapp.stock.aReponer',
    'nombreapp.stock.categorias',
    'nombreapp.stock.listadoCategorias',
    'nombreapp.stock.cajas',
    'nombreapp.stock.clientes',
    'nombreapp.stock.gastos',
    'nombreapp.stock.depositos',
    'nombreapp.stock.resumenCajaDiaria',
    'nombreapp.nav',
    'ac-search-panel'
]).
    config(['$routeProvider', function ($routeProvider) {
        //$routeProvider.otherwise({redirectTo: '/listado_productos'});
    }]).controller('MainCtrl', MainCtrl);

function MainCtrl(){
    var vm = this;
    vm.data = [{ref:'#/cajas',name:'Caja'},
        {ref:'#/resumen_caja_diaria',name:'Resumen de Caja Diaria'},
        {ref:'#/historico_cajas_diaria',name:'Histórico de Cajas Diarias'},
        {ref:'#/movimientos',name:'Movimientos'},
        {ref:'#/listado_productos',name:'Lista de Productos'},
        {ref:'#/listado_pedidos',name:'Lista de Pedidos'},
        {ref:'#/listado_categorias',name:'Lista de Categorias'},
        {ref:'#/productos/0',name:'Nuevo Producto'},
        {ref:'#/pedidos/0',name:'Nuevo Pedido'},
        {ref:'#/categorias/0',name:'Nueva Categoria'},
        {ref:'#/gastos/0',name:'Gastos'},
        {ref:'#/depositos/0',name:'Depositos'},
        {ref:'#/a_reponer',name:'A Reponer'},
        {ref:'#/consulta_stock',name:'Consulta de Stock'}
    ];
}