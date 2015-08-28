// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
console.log("starting ionic");
angular.module('agentapp', ['ionic', "angular-hal", "agentapp.controllers"])
    .config(function($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    })
    .config(function($stateProvider, $urlRouterProvider) {
        console.log("configuring router");
        $urlRouterProvider.otherwise("login");
        console.log("configuring routes");
        $stateProvider
            .state("login", {
                url:"/login",
                templateUrl:"templates/login.html",
                controller:"LoginCtrl",
                public: true
            })
            .state("home", {
                url:"/home",
                templateUrl:"templates/tickets.html",
                controller:"TicketCtrl"
            })
            .state("new_ticket", {
                url:"/new_ticket",
                templateUrl:"templates/new_ticket.html",
                controller:"NewTicketCtrl"
            })
            .state("help", {
                url:"/help",
                template:"<ion-view view-title='Help'><h1>Help</h1><p>Please help yourself</p></ion-view>",
                public: true
            });
    })
    .factory("UserInfo", function() {
        var userData = {};
        return {
            isLoggedIn: function() {
                return userData.username != null;
            },
            getUserData: function() {
                return angular.extend({}, userData);
            },
            setUserData: function(data) {
                userData = angular.extend(userData, data);
            }
        };
    })
    .factory("TicketInfo", function() {
        var ticketData = {};
        return {
            getTicketData: function() {
                return angular.extend({}, ticketData);
            },
            setTicketData: function(data) {
                userData = angular.extend(ticketData, data);
            }
        };
    })
    .factory('RESTService', [ 'halClient', function(halClient) {
        console.log("creating rest service");
        
        var root = halClient.$get("http://10.141.2.157:6543/api/v2");
        return  {
            "url": "http://10.141.2.157:6543",
            "set_url": function(new_root) {
                this.url = new_root;
                root = halClient.$get(new_root + "/api/v2");
                return root;
            },
            "start": function() {
                return root;
            },
            'login' : function(username, password) {
                console.error("Logging in with:", username, password);
                return root.then(function(resource) {
                    return resource.$get("uly:app").then(function(app) {
                        console.log("got app:", app);
                        return app.$post("uly:signin", { "username":username, "password":password});
                    });
                });
            },
            'load' : function() {
                return root.then(function(resource) {
                    return resource.$get("uly:data");
                })
                    .then(function(data) {
                        return data.$get("uly:ticket", {"embed":1});
                    });
            },
            'new_ticket' : function(title, body) {
                console.error("Creating new ticket in with:", title, body);
                return root.then(function(resource) {
                    return resource.$get("uly:data").then(function(data) {
                        console.log("got data:", data);
                        return data.$post("uly:ticket", {}, { "description":title, "body":body});
                    });
                });
            }
        };
    }])
    .run(function($ionicPlatform, $rootScope, $location, UserInfo, $state) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
        console.log("running");
        $rootScope.$on('$stateChangeStart', function (ev, next, nextparams, curr, currparams) {
            console.log("route change start:", next);
            if (next && !next.public) {
                var user = UserInfo.getUserData();
                if (!(user && user.fullname))  {
                    ev.preventDefault();
                    $state.go("login");
                }
            }
        });
        
    });
