auctionApp.controller("DashBoardCtrl", function($rootScope,$scope, $http,$location,$q,LoggedInCheck,host,$window,$interval,$timeout,ipCookie) {

    var userDetails = LoggedInCheck.loggedUserDetails;

    if (LoggedInCheck.loginCheck == true) {
        $scope.presentUser = JSON.parse(userDetails);
        $scope.activeAuction = new Object();
        $scope.message = null;
        $scope.Timer = null;
        $scope.flag = false;
        $scope.currentwinner = null;

        showUserInventory($scope.presentUser.userName);
        showActiveAuction();
        showUserDetails($scope.presentUser.userName);

        $scope.checkAuction = function(){
            showActiveAuction();
        };

        $scope.$watch('timeRemaining', function(newVal, oldVal){
            if (newVal <= 0) {
                $scope.timeRemaining = null;
                if (angular.isDefined($scope.Timer)) {
                    $interval.cancel($scope.Timer);
                }
                if($scope.KeyTurn == true) {
                    if($scope.activeAuction.minBid) {
                        auctionDone();
                        $interval.cancel($scope.Timer);
                    }
                    else {
                        auctionDone();
                        $interval.cancel($scope.Timer);
                    }
                }
            }
        }, true);

        function auctionDone(){
            $scope.KeyTurn = false;
            $http({
                url: host + "auctions/submit",
                method: "POST",
                data : {
                    userName : $scope.presentUser.userName,
                    userBal : $scope.presentUser.userBal
                },
                crossDomain: true
            }).success(function (data, status, headers, config) {
                if(data.err == true){
                    var tempdata = new Object();
                    tempdata.userName = data.userName;
                    tempdata.itemName = data.itemName;
                    tempdata.itemQuantity = data.itemQuantity;
                    tempdata.minBid = data.minBid;
                    tempdata.startTimeStamp = data.startTimeStamp;
                    if($scope.presentUser.userName == tempdata.userName) {
                        console.log("ONLY ONCE");
                        auctionCompletion($scope.presentUser.userName,data.msg);
                        if($scope.flag) {
                            restartAuction(data);
                        }
                        $scope.flag = false;

                    }
                }else{
                    $interval.cancel($scope.Timer);
                    $scope.activeAuction = data[0];
                    auctionCompletion($scope.presentUser.userName);
                }
            }).error(function (data, status, headers, config) {
                console.log("Error In get Inventories for user", data);
                $scope.message = data.message;
            });
        }

        // Function to place bid for a running auction
        $scope.placeBid = function(){
            if(($("#bidVal").val().trim()) && ($("#bidVal").val().trim() <= $scope.presentUser.userBal)) {
                var resObj = {
                    minBid: $scope.activeAuction.minBid,
                    itemName: $scope.activeAuction.itemName,
                    itemQuantity: $scope.activeAuction.itemQuantity,
                    bidderName: $scope.presentUser.userName,
                    bidderBid: parseInt($("#bidVal").val().trim())
                };
                $http({
                    url: host + "auctions/bidAuction", //for particular user, we want to add user's information into auction table.
                    method: "POST",
                    data: resObj,
                    crossDomain: true
                }).success(function (data, status, headers, config) {
                    if (data.err != true) {
                        errToggleModal("Bid has been posted! Thanks.");
                    }
                    $scope.timeRemaining = $scope.timeRemaining + 10;
                    $scope.currentwinner = $scope.presentUser.userName;
                }).error(function (data, status, headers, config) {
                    console.log("Error In get Inventories for user", data);
                    $scope.message = data.message;
                });
            }else{
                errToggleModal("Bid value should be less than total Coins! Please Bid with a lower value.");
            }
        };

        // Function to start an auction
        $scope.startAuction = function(){            
            if($scope.presentAutionDetails.itemQuantity <= $scope.presentAutionDetails['oldQuantity']){
                $http({
                    url: host + "auctions/create",
                    method: "POST",
                    data: {
                        itemName: $scope.presentAutionDetails.itemName,
                        itemQuantity: $scope.presentAutionDetails.itemQuantity,
                        minBid: $scope.presentAutionDetails.minBid,
                        name: $scope.presentAutionDetails.userName,
                        startTimeStamp: new Date().getTime()
                    },
                    crossDomain: true
                }).success(function (data, status, headers, config) {
                    if (data.err != true) {
                        $("#startAuctionModal").modal('toggle');
                        $window.location.reload();
                        $scope.activeAuction = data;
                    } else {
                        errToggleModal(data.msg);
                    }
                }).error(function (data, status, headers, config) {
                    errToggleModal(data)
                });
            }else{
                errToggleModal("Item Quantity should be less than " + $scope.presentAutionDetails['oldQuantity']);
            }
        };

        $scope.closePop = function(){
            $("#startAuctionModal").modal('toggle');
        };

        $scope.deregister = function () {
            //console.log($scope.activeAuction.bidderBid);
            console.log($scope.presentUser.userName);
            console.log($scope.currentwinner);
            console.log($scope.currentseller);
        
            if($scope.currentwinner != null){
                errToggleModal1("User cant be deregistered.");
            }else{
                console.log("oh ya ya"); 
                $http({
                    url: host + "user/deregister",
                    method: "GET",
                    data: {
                        userName: $scope.presentUser.userName
                    },
                    crossDomain: true
                }).success(function (data, status, headers, config) {
                    if (data.err != true) {
                        errToggleModal1("User is deregisterd.");
                        console.log("DONE DEREGISTERD");
                        LoggedInCheck.setLogged(false);
                        ipCookie.remove('auctionCookie');
                        localStorage.removeItem('lastLogin');
                        $location.path("/login");
                    } else {
                        errToggleModal1(data.msg);
                    }
                }).error(function (data, status, headers, config) {
                    errToggleModal1(data)
                });
            }
        };
    
        function errToggleModal(err){
            $(".loaderImage").hide();
            $scope.message = err;
            $('#deregisterErrorModal').modal('toggle');
            setTimeout(function () {
                $scope.message = '';
                $('#deregisterErrorModal').modal('toggle');
            }, 1500);
        }

        function restartAuction(tempdata) {
            console.log("restart auction");
            console.log(tempdata.itemName);           
                    $http({
                        url: host + "auctions/create",
                        method: "POST",
                        data: {
                            itemName: tempdata.itemName,
                            itemQuantity: tempdata.itemQuantity,
                            minBid: tempdata.minBid,
                            name: tempdata.userName,
                            startTimeStamp: tempdata.startTimeStamp
                        },
                        crossDomain: true
                    }).success(function (data, status, headers, config) {
                        if (data.err != true) {
                            $window.location.reload();
                            console.log(data);
                            $scope.activeAuction = data;
                        } else {
                            restartAuction(tempdata);
                        }
                    }).error(function (data, status, headers, config) {
                        errToggleModal(data)
                    });
            console.log("end of restart auction");
        }
    
        function errToggleModal1(err){
            $(".loaderImage").hide();
            $scope.message = err;
            $('#deregisterErrorModal').modal('toggle');
            setTimeout(function () {
                $scope.message = '';
                $('#deregisterErrorModal').modal('toggle');
            }, 1500);
        }

        // Shows details for user
        function showUserDetails(name) {
            $http({
                url: host + "users/find/" + name,
                method: "GET",
                crossDomain: true
            }).success(function (data, status, headers, config) {
                $scope.presentUser = data;
            }).error(function (data, status, headers, config) {
                console.log("Error In get Inventories for user", data);
                $scope.message = data.message;
            });
        }

        //Shows details for Inventories
        function showUserInventory(name) {
            $http({
                url: host + "inventories/find/" + name,
                method: "GET",
                crossDomain: true
            }).success(function (data, status, headers, config) {
                $scope.inventoryArr = data;
            }).error(function (data, status, headers, config) {
                console.log("Error In get Inventories for user", data);
                $scope.message = data.message;
            });
        }

        // Shows details about the active auction.
        function showActiveAuction() {
            $http({
                url: host + "auctions/find",
                method: "GET",
                crossDomain: true
            }).success(function (data, status, headers, config) {
                $scope.activeAuction = data[0];
                if(data.length > 0) {
                    $scope.Timer = $interval(function () {
                        $scope.timeRemaining = ((data[0].startTimeStamp + 90000) - new Date().getTime()) / 1000;
                        $scope.KeyTurn = true;
                    }, 1000);
                }
            }).error(function (data, status, headers, config) {
                console.log("Error In get Inventories for user11", data);
                $scope.message = data.message;
            });
        }

        function errToggleModal(err){
            $(".loaderImage").hide();
            $scope.message = err;
            $('#loginErrorModal').modal('toggle');
            setTimeout(function () {
                $scope.message = '';
                $('#loginErrorModal').modal('toggle');
            }, 1500);
        }

        // Completes the auction, updates the inventories & coins and shows results.
        function auctionCompletion(itemData,err){
            $http({
                url: host + "auctions/deleteAuction/" + itemData,
                method: "GET",
                crossDomain: true
            }).success(function (data, status, headers, config) {
                var msg;
                if(err){
                    msg = err;
                }else{
                    msg =  "Winning bid is by " + $scope.activeAuction.bidderName + " of " + $scope.activeAuction.bidderBid + " Coins.";
                }
                $scope.message =  msg;
                $('#loginErrorModal').modal('toggle');
                showUserDetails(itemData);
                showUserInventory(itemData);
                showActiveAuction();
                setTimeout(function () {
                    $window.location.reload();
                    $scope.message =  '';
                    $('#loginErrorModal').modal('toggle');
                    $scope.message = '';
                }, 1500);
            }).error(function (data, status, headers, config) {
                console.log("Error In get Inventories for user", data);
                $scope.message = data.message; // remove it
            });
            $scope.flag = true;
        }

    }else{
        $location.path("/login");
        $scope.error = true;
    }
});
