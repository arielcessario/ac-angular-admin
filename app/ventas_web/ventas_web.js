(function () {

    'use strict';


    angular.module('nombreapp.stock.ventasWeb', ['ngRoute', 'toastr', 'nombreapp.stock.nacionalidades'
        , 'acAngularLoginClient'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/ventas_web/:id', {
                templateUrl: './ventas_web/ventas_web.html',
                controller: 'VentasWebController'
            });
        }])

        .controller('VentasWebController', VentasWebController)
        .service('VentasWebService', VentasWebService);

    VentasWebController.$inject = ['acAngularLoginClientService', "$scope", "$routeParams", "VentasWebService", "$location", "toastr", 'acNacionalidadesService'];
    function VentasWebController(acAngularLoginClientService, $scope, $routeParams, VentasWebService, $location, toastr, acNacionalidadesService) {
        acAngularLoginClientService.checkCookie();

        var vm = this;
        vm.isUpdate = false;
        vm.confirmarVentaWeb = confirmarVentaWeb;
        vm.ventaWeb = {};
        vm.id = $routeParams.id;




        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            VentasWebService.getVentasWebByID(vm.id, function (data) {
                //console.log(data);
                vm.ventaWeb = data;

            });
        }


        function confirmarVentaWeb() {
            VentasWebService.confirmarVentaWeb(vm.ventaWeb.carrito_id, function (data) {

                toastr.success('Venta confirmada con éxito');
                $location.path('/listado_ventas_web');

            })
        }
    }


        VentasWebService.$inject = ['$http'];
        function VentasWebService($http) {
            var service = {};
            var url = './stock-api/ventas_web.php';
            service.getVentasWeb = getVentasWeb;
            service.getVentasWebByID = getVentasWebByID;
            service.confirmarVentaWeb = confirmarVentaWeb;
            service.getVentasSinConfirmar = getVentasSinConfirmar;


            return service;

            function confirmarVentaWeb(carrito_id, callback){
                return $http.post(url,
                    {function:'confirmarVentaWeb', carrito_id:carrito_id})
                    .success(function(data){callback(data)})
                    .error(function(data){callback(data)})
            }


            function getVentasWeb(callback) {
                return $http.post(url,
                    {function: 'getVentasWeb'},
                    {cache: true})
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function(data){

                    });
            }

            function getVentasWebByID(id, callback) {
                getVentasWeb(function (data) {
                    //console.log(data);
                    var response = data.filter(function (entry) {
                        return entry.carrito_id === parseInt(id);
                    })[0];
                    callback(response);
                })

            }

            function getVentasSinConfirmar(callback) {
                getVentasWeb(function (data) {
                    //console.log(data);
                    var response = data.filter(function (entry) {
                        return entry.status === 3;
                    });
                    callback(response);
                })

            }


        }

    }

    )
    ();

