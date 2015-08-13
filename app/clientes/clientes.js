(function () {

    'use strict';


    angular.module('nombreapp.stock.clientes', ['ngRoute', 'toastr', 'nombreapp.stock.nacionalidades'
        , 'acAngularLoginClient'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/clientes/:id', {
                templateUrl: './clientes/clientes.html',
                controller: 'ClientesController'
            });
        }])

        .controller('ClientesController', ClientesController)
        .service('ClientesService', ClientesService);

    ClientesController.$inject = ['acAngularLoginClientService', "$scope", "$routeParams", "ClientesService", "$location", "toastr", 'acNacionalidadesService'];
    function ClientesController(acAngularLoginClientService, $scope, $routeParams, ClientesService, $location, toastr, acNacionalidadesService) {
        acAngularLoginClientService.checkCookie();

        var vm = this;
        vm.isUpdate = false;

        vm.save = save;
        vm.delete = deleteCliente;
        vm.id = $routeParams.id;
        vm.nacionalidades = [];
        vm.nacionalidad = {};
        vm.cliente = {
            nombre: '',
            apellido: '',
            mail: '',
            nacionalidad_id: '',
            tipo_doc: 0,
            nro_doc: '',
            comentarios: '',
            marcado: 0,
            fecha_nacimiento: ''
        };


        acNacionalidadesService.get(function (data) {
            //console.log(data);
            vm.nacionalidades = data;
            vm.nacionalidad = data[11];
        });

        if (vm.id == 0) {
            vm.isUpdate = false;
        } else {
            vm.isUpdate = true;

            ClientesService.getClienteByID(vm.id, function (data) {
                vm.cliente = data;

            });
        }

        function deleteCliente() {

            var r = confirm("Realmente desea eliminar la cliente? Esta operación no tiene deshacer.");
            if (r) {

                ClientesService.deleteCliente(vm.id, function (data) {
                    toastr.success('Cliente eliminado');
                    $location.path('/listado_clientes');
                });
            }
        }


        function save() {
            if (vm.cliente.nombre == '') {
                toastr.error('El nombre es obligatorio');
                return;
            }
            if (vm.cliente.apellido == '') {
                toastr.error('El apellido es obligatorio');
                return;
            }
            if (vm.cliente.mail == '') {
                toastr.error('El mail es obligatorio');
                return;
            }
            if (vm.cliente.nro_doc == '') {
                toastr.error('El Nro de documento es obligatorio');
                return;
            }
            if (vm.cliente.fecha_nacimiento == '') {
                toastr.error('La fecha de nacimiento es obligatoria');
                return;
            }


            if (vm.isUpdate) {
                ClientesService.saveCliente(vm.cliente, 'update', function (data) {

                    toastr.success('Cliente salvada con exito');
                    $location.path('/listado_clientes');
                });
            } else {
                ClientesService.saveCliente(vm.cliente, 'save', function (data) {

                    toastr.success('Cliente salvada con exito');
                    $location.path('/listado_clientes');
                });
            }
        }

    }


    ClientesService.$inject = ['$http'];
    function ClientesService($http) {
        var service = {};
        var url = './stock-api/clientes.php';
        service.getClientes = getClientes;
        service.getClienteByID = getClienteByID;
        service.getClienteByName = getClienteByName;
        service.saveCliente = saveCliente;
        service.deleteCliente = deleteCliente;
        service.getDeudores = getDeudores;
        service.getDeudorById = getDeudorById;
        service.actualizarSaldo = actualizarSaldo;


        return service;

        function actualizarSaldo(cliente_id, importe, callback) {
            return $http.post(url, {
                function: 'actualizarSaldo',
                importe: importe, cliente_id: cliente_id
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });
        }


        function getDeudores(callback) {
            return $http.post(url, {function: 'getDeudores'})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(data);
                });
        }

        function getDeudorById(id, callback){
            getDeudores(function(data){
                var response = data.filter(function(elem, index, array){
                    return id = elem.cliente_id;
                })[0];

                callback(response);
            })
        }

        function getClientes(callback) {
            return $http.post(url,
                {function: 'getClientes'},
                {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function(data){

                });
        }

        function getClienteByID(id, callback) {
            getClientes(function (data) {
                //console.log(data);
                var response = data.filter(function (entry) {
                    return entry.cliente_id === parseInt(id);
                })[0];
                callback(response);
            })

        }

        function getClienteByName(name, callback) {
            getClientes(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.apellido.indexOf(name);
                    }

                    if (n === undefined || n === -1) {
                        n = elem.mail.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
                });
                callback(response);
            })

        }


        function saveCliente(cliente, _function, callback) {

            return $http.post(url,
                {function: _function, cliente: JSON.stringify(cliente)})
                .success(function (data) {
                    console.log(data);
                    callback(data);
                })
                .error();
        }


        function deleteCliente(id, callback) {
            return $http.post(url,
                {function: 'deleteCliente', id: id})
                .success(function (data) {
                    callback(data);
                })
                .error();
        }

    }

})();

