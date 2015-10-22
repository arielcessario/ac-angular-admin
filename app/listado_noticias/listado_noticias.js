(function(){
    'use strict';

    angular.module('nombreapp.stock.listadoNoticias', ['ngRoute'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/listado_noticias', {
                templateUrl: './listado_noticias/listado_noticias.html',
                controller: 'ListadoNoticiasController'
            });
        }])

        .controller('ListadoNoticiasController', ListadoNoticiasController);


    ListadoNoticiasController.$inject = ['NoticiasService', '$location'];
    function ListadoNoticiasController(NoticiasService, $location) {


        var vm = this;

        vm.noticias = [];
        vm.detalle = detalle;

        function detalle(id){
            $location.path('/noticias/'+id);
        }

        NoticiasService.getNoticias(
            function (data){
                //console.log(data);
                //for(var i = 0; i<data.length; i++){
                //
                //    var fecha = data[i].fecha.getDate();
                //    console.log(fecha);
                //}
                vm.noticias = data;
            }
        );

    }


})();