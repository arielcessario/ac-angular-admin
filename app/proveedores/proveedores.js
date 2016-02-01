(function () {

    'use strict';


    angular.module('nombreapp.stock.proveedores', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/proveedores/:id', {
                templateUrl: './proveedores/proveedores.html',
                controller: 'ProveedoresController',
                data: {requiresLogin: true}
            });
        }])

        .controller('ProveedoresController', ProveedoresController)
        .service('ProveedoresService', ProveedoresService);

    ProveedoresController.$inject = ["$http", "$scope", "$routeParams", "ProveedoresService", "$location", "toastr", "AcUtils"];
    function ProveedoresController($http, $scope, $routeParams, ProveedoresService, $location, toastr, AcUtils) {
        var vm = this;
        vm.isUpdate = false;
        vm.status = 1;
        vm.destacado = 0;
        vm.fotos = [];
        vm.save = save;
        vm.delete = deleteProveedor;
        vm.listProveedores = [];
        vm.id = $routeParams.id;
        vm.proveedor = {
            nombre: '',
            cuit: '',
            telefono: 0,
            mail: 1
        };

        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            ProveedoresService.getProveedorByID(vm.id, function (data) {
                vm.proveedor = data;

            });
        }

        function deleteProveedor() {

            var r = confirm("Realmente desea eliminar el producto? Esta operación no tiene deshacer. Si solo desea ocultarlo, cambie el estado a 'Inactivo'");

            if (r) {
                ProveedoresService.deleteProveedor(vm.id, function (data) {
                    toastr.success('Proveedor eliminado');
                    $location.path('/listado_proveedores');
                });
            }
        }

        function save() {


            if(!AcUtils.validateEmail(vm.proveedor.mail)) {
                toastr.error('El mail es incorrecto');
                return;
            }
            //console.log(vm.producto);

            if (vm.isUpdate) {
                ProveedoresService.updateProveedor(vm.proveedor, function (data) {
                    toastr.success('Proveedor guardado con exito');
                    $location.path('/listado_proveedores');
                });
            } else {
                ProveedoresService.saveProveedor(vm.proveedor, function (data) {
                    toastr.success('Proveedor guardado con exito');
                    $location.path('/listado_proveedores');
                });
            }
        }




    }



    ProveedoresService.$inject = ['$http'];
    function ProveedoresService($http) {
        var service = {};
        var url = './stock-api/proveedores.php';
        service.getProveedores = getProveedores;
        service.getProveedorByID = getProveedorByID;
        service.getProveedorByName = getProveedorByName;
        service.saveProveedor = saveProveedor;
        service.deleteProveedor = deleteProveedor;
        service.updateProveedor = updateProveedor;


        return service;

        function getProveedores(callback) {
            return $http.get(url+'?function=getProveedores',
                {cache: false})
                .success(function (data) {
                    callback(data);
                })
                .error(function(data){

                });
        }

        function getProveedorByID(id, callback) {
            getProveedores(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.proveedor_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getProveedorByName(name, callback) {
            getProveedores(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.nombre.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
                });
                callback(response);
            })

        }




        function saveProveedor(proveedor, callback) {

            return $http.post(url,
                {function: 'saveProveedor', proveedor: JSON.stringify(proveedor)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }



        function updateProveedor(proveedor, callback) {

            return $http.post(url,
                {function: 'updateProveedor', proveedor: JSON.stringify(proveedor)})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

        function deleteProveedor(id, callback) {
            return $http.post(url,
                {function: 'deleteProveedor', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

