angular.module('agentapp.controllers', ['ionic', "angular-hal"])
    .controller('TicketCtrl', function($scope, RESTService) {
        $scope.tickets = $scope.tickets || [];
        RESTService.load().then(function(ticketcoll) {
            ticketcoll.$get("item").then(function(items) {
                console.log("Got results:", items);
                $scope.tickets = items;
                $scope.$broadcast('scroll.refreshComplete');
            });
        }, function(error) { console.error("error:", arguments); });
    })
    .controller("LoginCtrl", function($scope, $state, RESTService, UserInfo) {
        $scope.user_data = $scope.user_data || {
            "username": "",
            "password": "",
            "server":RESTService.url
        };
        $scope.login = function() {
            if ($scope.user_data.server && RESTService.url != $scope.user_data.server) {
                RESTService.set_url($scope.user_data.server);
            }
            RESTService.login($scope.user_data.username, $scope.user_data.password).then(function(app) {
                if (app.error) {
                    $scope.error = app.error;
                }
                else {
                    app.$get("uly:user").then(function(user) {
                        UserInfo.setUserData({
                            "username": $scope.user_data.username,
                            "server":$scope.user_data.server,
                            "email": user.email,
                            "picture": user.picture,
                            "fullname": user.fullname,
                            "roles": user.roles
                        });
                    });
                    $scope.error = "";
                    //navigate to home
                    $state.go("home");
                }

            }, function(error) {
                $scope.error = "Invalid credentials";
            });
        };
    }).controller("NewTicketCtrl", function($scope, $state, RESTService, TicketInfo) {
        $scope.ticket_data = $scope.ticket_data || {
            "title": "Test New Ticket",
            "body": "Test Test 123"
        };
        $scope.new_ticket = function() {
            /*if ($scope.user_data.server && RESTService.url != $scope.user_data.server) {
                RESTService.set_url($scope.user_data.server);
            }*/
            RESTService.new_ticket($scope.ticket_data.title, $scope.ticket_data.body).then(function(app) {
                if (app.error) {
                    $scope.error = app.error;
                }
                else {
                    /*app.$get("uly:user").then(function(user) {
                        UserInfo.setUserData({
                            "username": $scope.user_data.username,
                            "server":$scope.user_data.server,
                            "email": user.email,
                            "picture": user.picture,
                            "fullname": user.fullname,
                            "roles": user.roles
                        });
                    });*/
                    alert("yay a new ticket!");
                    $scope.error = "";
                    //navigate to home
                    $state.go("home");
                }

            }, function(error) {
                $scope.error = "Error creating ticket: " + error;
            });
        };
    });


