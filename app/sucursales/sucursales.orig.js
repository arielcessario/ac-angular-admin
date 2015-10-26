(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;
    angular.module('nombreapp.stock.sucursales', ['ngRoute'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/module', {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: 'SucursalesController'
            });
        }])
        .controller('SucursalesController', sucursalesController)
        .service('SucursalesService', sucursalesService);


    sucursalesController.$inject = [];
    function sucursalesController() {

        var vm = this;


    }

    sucursalesService.$inject = ['$http'];
    function sucursalesService($http) {
        var service = {};
        var url = './stock-api/sucursales.php';

        service.getSucursales = getSucursales;
        service.getSucursalById = getSucursalById;
        service.getSucursalesByName = getSucursalesByName;

        return service;

        function getSucursales(callback) {
            return $http.post(url, {function: 'getSucursales'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {

                });
        }

        function getSucursalById(id, callback) {
           getSucursales(function (data) {
                var result = data.filter(function(elem, index, array){
                    return elem.sucursal_id == id;
                })[0];

               callback(result);

            });

        }


        function getSucursalesByName(name, callback){
           getSucursales(function(data){
                var results = data.filter(function(elem, index, array){
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
               });
               callback(results);
            });


        }
    }
})();