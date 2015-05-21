

/**
 * @ngdoc service
 * @name angularJs01App.login
 * @description
 * # login
 * Service in the angularJs01App.
 */
(function(){

    'use strict';
    angular.module('nombreapp.stock.nacionalidades', [])
        .factory('acNacionalidadesService',AcNacionalidadesService);


    AcNacionalidadesService.$inject = ['$http'];
    function AcNacionalidadesService ($http) {
                var vm = this;

                var url = './stock-api/nacionalidades.php';
                var service = {};

                service.get = function (callback) {
                    //return $http.post('./api/login.php', { username: username, password: password });
                    return $http.post(url,
                        {"function": "get"},
                        {cache: true})
                        .success(callback)
                        .error(function (data) {
                            //console.log(data);
                            vm.error = data.Message;
                            vm.dataLoading = false;
                        });
                };


                service.GetBy = function (callback, params) {
                    //return $http.post('./api/login.php', { username: username, password: password });
                    return $http.post('./directives/nacionalidades/api/nacionalidades.php',
                        {"function": "getBy", "params": params},
                        {cache: true})
                        .success(callback)
                        .error(function (data) {
                            //console.log(data);
                            vm.error = data.Message;
                            vm.dataLoading = false;
                        });
                };

                return service;
            }


})()/**
 * Created by desa on 1/2/15.
 */
