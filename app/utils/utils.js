(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length-1].src;
    angular.module('ac-utils', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/module', {
                templateUrl: currentScriptPath.replace('.js', '.html'),
                controller: 'AcUtils'
            });
        }])
        .controller('AcUtilsController', AcUtilsController)
        .factory('AcUtilsService', AcUtilsService)
        .service('AcUtilsGlobals', AcUtilsGlobals)
        .directive('acLastListItem', AcLastListItem)
    ;


    AcLastListItem.$inject = ['AcUtilsGlobals', '$rootScope'];
    function AcLastListItem(AcUtilsGlobals, $rootScope) {
        return function (scope, element, attrs) {
            //angular.element(element).css('color', 'blue');

            if (scope.$last) {
                //window.alert("im the last!");

                AcUtilsGlobals.isWaiting = false;
                $rootScope.$broadcast('IsWaiting');
            }


        };
    }

    AcUtilsController.$inject = [];
    function AcUtilsController() {
    }

    AcUtilsGlobals.$inject = [];
    function AcUtilsGlobals() {
        this.isWaiting = false;
        this.sucursal_auxiliar_id = -1;
    }




    AcUtilsService.$inject = [];
    function AcUtilsService() {
        var service = {};
        service.validateEmail = validateEmail;

        return service;


        function validateEmail(email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        }
    }
})();