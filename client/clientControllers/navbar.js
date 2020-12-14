auctionApp.controller("NavBarCtrl",['$scope', '$rootScope','$http','$location','ipCookie','LoggedInCheck',function($rootScope,$scope, $http,$location,ipCookie,LoggedInCheck) {

    if (LoggedInCheck.loginCheck == true) {
        $scope.error = false;
        $rootScope.presentEmail = JSON.parse(LoggedInCheck.loggedUserDetails).email;
    }else{
        LoggedInCheck.setLogged(false);
        ipCookie.remove('auctionCookie');
        localStorage.removeItem('lastLogin');
        $location.path("/login");
    }

    $scope.logout = function () {
        console.log("gigi");
        LoggedInCheck.setLogged(false);
        ipCookie.remove('auctionCookie');
        localStorage.removeItem('lastLogin');
        $location.path("/login");
    };

    $scope.deregister = function () {
        console.log("GOT IT");
        //console.log($scope.activeAuction.bidderBid);
        console.log($scope.presentUser.userName);
    
        if($scope.activeAuction.bidderBid>0){
            errToggleModal("User cant be deregistered.");
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
                    errToggleModal("User is deregisterd.");
                } else {
                    errToggleModal(data.msg);
                }
            }).error(function (data, status, headers, config) {
                errToggleModal(data)
            });
        }
        LoggedInCheck.setLogged(false);
        ipCookie.remove('auctionCookie');
        localStorage.removeItem('lastLogin');
        $location.path("/login");
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

}]);
