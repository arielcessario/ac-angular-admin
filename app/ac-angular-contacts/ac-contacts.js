(function () {
    'use strict';
    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    if (currentScriptPath.length == 0) {
        //currentScriptPath = window.installPath + '/ac-angular-usuarios/includes/ac-usuarios.php';
        currentScriptPath = './ac-angular-contacts/includes/ac-contacts.php';
    }else{
        currentScriptPath = currentScriptPath.replace('ac-contacts.js', 'includes/ac-contacts.php');
    }

    angular.module('acContacts', ['ngRoute'])
        .controller('ContactoController', ContactoController)
        .service('ContactsService', ContactsService);


    ContactoController.$inject = [];
    function ContactoController() {
        var vm = this;

    }

    ContactsService.$inject = ['$http', '$timeout'];
    function ContactsService($http, $timeout) {
        var vm = this;
        var service = {};
        vm.enviado = false;
        service.sendMail = sendMail;
        service.facebookInit = facebookInit;


        return service;

        // Inicialización de facebook, este es el código que iría en fb-root
        function facebookInit() {
            fuckFacebook(document, 'script', 'facebook-jssdk');
        }

        function fuckFacebook(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v2.5";
            fjs.parentNode.insertBefore(js, fjs);


        }


        /**
         * @description Envio mails a los destinatarios que necesito
         * @param mail_origen
         * @param mails_destino lista de mails de envío, array
         * @param nombre
         * @param asunto
         * @param mensaje
         * @param callback
         * @returns {*}
         */
        function sendMail(mail_origen, mails_destino, nombre, asunto, mensaje, callback) {

            return $http.post(currentScriptPath,
                {
                    'mail_origen': mail_origen,
                    'mails_destino': JSON.stringify(mails_destino),
                    'nombre': nombre,
                    'asunto': asunto,
                    'mensaje': mensaje
                })
                .success(
                    function (data) {

                        $timeout(hideMessage, 3000);

                        function hideMessage() {
                            callback(data, true);
                        }

                        //goog_report_conversion('http://www.ac-desarrollos.com/#');
                    })
                .error(function (data) {
                    console.log(data);
                });
        }
    }
})();