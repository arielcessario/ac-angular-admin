(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length-1].src;
    //console.log(currentScriptPath);

    angular.module('acAngularWaiting', ['ngRoute'])
        .directive('acAngularWaiting', AcAngularWaiting);


    AcAngularWaiting.$inject = ['$location', '$route', 'AcUtilsGlobals'];

    function AcAngularWaiting($location, $route, AcUtilsGlobals) {
        return {
            restrict: 'E',
            scope: {
                shown: '='
            },
            templateUrl: currentScriptPath.replace('.js', '.html'),
            controller: function ($scope, $compile, $http) {

                var vm = this;

                $scope.$on('IsWaiting', function() {
                    //console.log('ssss');
                    vm.isWaiting = AcUtilsGlobals.isWaiting;
                    //vm.productosCarrito = acAngularCarritoTotalService.productosCarrito;
                    //vm.carrito = acAngularCarritoTotalService.carrito;
                    //vm.totalProductosEnCarrito = acAngularCarritoTotalService.totalProductos;
                    //vm.modified = true;
                    //$timeout(function(){
                    //    vm.modified = false;
                    //}, 1000);
                });

                vm.isWaiting = AcUtilsGlobals.isWaiting;

            },

            controllerAs: 'acAngularWaitingCtrl'
        };
    }

})();