(function () {

    'use strict';


    angular.module('nombreapp.stock.ofertas', ['ngRoute', 'toastr', 'nombreapp.stock.proveedores'
        , 'nombreapp.stock.categorias', 'slider.manager'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/ofertas', {
                templateUrl: './ofertas/ofertas.html'
            });
        }])
;




})();

