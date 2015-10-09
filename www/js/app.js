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

            .state('tab', {
              url: '/tab',
              abstract: true,
              templateUrl: 'templates/tabs.html'
            })

            .state("login", {
                url:"/login",
                templateUrl:"templates/login.html",
                controller:"LoginCtrl",
                public: true
            })

            .state('tab.tickets', {
              url: '/tickets',
              views: {
                'tab-tickets': {
                  templateUrl: 'templates/tickets.html',
                  controller: 'TicketCtrl'
                }
              }
            })

            .state('tab.ticket-detail', {
              url:"/tickets/:ticketId",
              views: {
                'tab-ticket-detail': {
                  templateUrl: 'templates/ticket.html',
                  controller: 'TicketDetailCtrl'
                }
              }
            })

            .state("new_ticket", {
                url:"/new_ticket",
                templateUrl:"templates/new_ticket.html",
                controller:"NewTicketCtrl"
            })
            .state("help", {
                url:"/help",
                template:"<ion-view view-title='Help'><ion-content><h1>Help</h1><p>Please help yourself</p></ion-content></ion-view>",
                public: true
            });
    })

    .factory("UserInfo", function() {

        console.log("creating UserInfo service");
        var userData = {};
        var token = null;
        return {
            isLoggedIn: function() {
                return userData.username != null;
            },
            getUserData: function() {
                return angular.extend({}, userData);
            },
            setUserData: function(data) {
                userData = angular.extend(userData, data);
            },
            getToken: function() {
                return token;
            },
            setToken: function(tk) {
                token = tk;
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

    .factory('RESTService', function(halClient, UserInfo) {
        console.log("creating rest service");

        var root = halClient.$get("http://10.141.2.176:6543/api/v2/");
        return  {
            "url": "http://10.141.2.176:6543",
            "set_url": function(new_root) {
                this.url = new_root;
                root = halClient.$get(new_root + "/api/v2");
                return root;
            },
            "start": function() {
                return root;
            },
            'login_rest' : function(username, password) {
                //console.error("Logging in with:", username, password);
                return root.then(function(resource) {
                    return resource.$get("uly:app").then(function(app) {
                        return app.$post("uly:signin", {
                                "username":username,
                                "password":password,
                                "source": "token"
                        });
                    }).then(function(login) {
                        console.log("got login:", login);
                        if (login.token) {
                          console.log("Im here:", login);
                            UserInfo.setToken(login.token);
                        }
                        return login.$get("uly:app");
                    });
                });
            },
            'load' : function() {
                return root.then(function(resource) {
                    return resource.$get("uly:data");
                })
                    .then(function(data) {
                        console.log("loading tickets now");
                        var currentUser = UserInfo.getUserData();
                        var uid = currentUser.id;
                        var filter = "assignee_id='"+uid+"'";
                        console.log("Done Loading Tickets");
                        return data.$get("uly:ticket", {"embed":1, "filters":filter });
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
            },
            loadTicket: function(id) {
                return root.then(function(resource) {
                    return resource.$get("uly:data");
                })
                    .then(function(data) {
                        return data.$get("find", {"rel":"ticket/"+id});
                    });
            }

        };
    })

    .factory('httpRequestInterceptor', function (UserInfo) {
        return {
            request: function (config) {
                var token = UserInfo.getToken();
                if (token) {
                    config.headers = angular.extend(config.headers || {}, {
                        'Authorization':'Bearer ' + token
                    });
                }
                console.log("setting headers:", config.headers, "with token", token);
                // use this to prevent destroying other existing headers
                // config.headers['Authorization'] = 'authentication;

                return config;
            },
            response: function(response) {
                //check the X-Ulysses-Token header
                console.log("Got headers:", response.headers(), response.headers("X-Ulysses-Token"));
                token = response.headers()["X-Ulysses-Token"];
                if(token) {
                    console.log("set token to:", token);
                    UserInfo.setToken(token);
                }
                return response;
            }
        };
    })
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');
    })
    .config(function($ionicConfigProvider) {
      $ionicConfigProvider.tabs.position('bottom');
    })
    .run(function($ionicPlatform, $rootScope, $location, UserInfo, $state) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
              StatusBar.styleLightContent();
            }
        });
        console.log("running");
        $rootScope.$on('$stateChangeStart', function (ev, next, nextparams, curr, currparams) {
            console.log("next:", next, next && next.public);
            if (next && !next.public) {
                var user = UserInfo.getUserData();
                console.log("got user:", user);
                if (!(user && user.fullname))  {
                    ev.preventDefault();
                  console.log("go back login");
                    $state.go("login");
                }
            }
        });

    });
