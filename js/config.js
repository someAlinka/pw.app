var pwApp = angular.module('pwApp', ['ngRoute', 'ngResource']);

/* Config */
pwApp.config([
    '$routeProvider', '$locationProvider',
    function($routeProvide, $locationProvider){
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        })
        $routeProvide
            .when('/',{
                templateUrl:'template/home.html',
                controller:'ParrotCtrl'
            })
            .when('/registration',{
                templateUrl:'template/registration.html',
                controller:'RegistrationCtrl'
            })
            .when('/profile',{
                templateUrl:'template/profile.html',
                controller:'ProfileCtrl'
            })
            .when('/transaction',{
                templateUrl:'template/transaction.html',
                controller:'TransactionCtrl'
            })
            .when('/history',{
                templateUrl:'template/history.html',
                controller:'HistoryCtrl'
            })
            .otherwise({
                redirectTo: '/' //404 to main
            });
    }
]);