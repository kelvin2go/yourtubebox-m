angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
    $scope.audioPlaylist = [];
    $scope.playing_mp3 = {};
    $scope.playlists = [
        { title: 'Latest', id: 1 },
        { title: 'Hot', id: 2 }
    ];
    $scope.imgList = [
        { file_name: '1.jpg'},
        { file_name: '2.jpg'},
        { file_name: '3.jpg'}
    ];
    $scope.loop = 1; // 0 - off, 1 - repeat-one, 2 - repeat list

    $scope.yourtubebox = [];
    $scope.clickToPlay = function( $path, $img, $title, $vid ){

        $scope.playing_mp3.title = $title;
        $scope.playing_mp3.url = $path;
        $scope.playing_mp3.img = $img;
        $scope.playing_mp3.vid = $vid;
        $scope.playing_mp3.url_m = encodeURIComponent( 'http://share-find.com/yourtubebox/#/V/'+$vid);

        $scope.audioPlaylist.push(
            {
                src: $path,
                type: 'audio/mpeg',
                media: "",
                title: $title,
                img: $img,
                img_base: $img.replace("1.jpg", ""),
                vid: $vid,
                url_m: encodeURIComponent( 'http://share-find.com/yourtubebox/#/V/'+$vid )
            }
        );
    };

})

.controller('PlaylistsCtrl', function($scope ) {


})
.controller('PlayerCtrl', function($scope, $timeout ) {

    $scope.toggleLoop = function (){
        $timeout(function() {
            if ( $scope.loop === 0 ){
                $scope.loop = 1;
            } else if ( $scope.loop === 1){
                $scope.loop = 2;
            } else {
                $scope.loop = 0;
            }
        }),1000;
    }

})
.controller('YourtubeboxCtrl', function($scope , $http, $timeout, $analytics) {
    $scope.saveMp3 = function() {
        $analytics.eventTrack('eventName', {
            category: 'youtube-link', action:'inputed' ,label: $scope.yourtubebox.youtubeurl
        });
        $scope.yourtubebox.processing = true;
        $http({
            method : 'GET',
            contentType: "application/json; charset=utf-8",
            url : 'http://share-find.com/ytmp3/toMp3.php?url='+encodeURIComponent($scope.yourtubebox.youtubeurl),
            dataType: 'json',
            crossDomain:true
        }).success ( function(data) {
            $scope.yourtubebox.success = true;
            $scope.yourtubebox.processing = false;
            $scope.yourtubebox.mp3_url = 'http://share-find.com/ytmp3/toMp3.php?mp3='+encodeURIComponent(data.mp3.name);
            $scope.yourtubebox.mp3_url_s = '//share-find.com/ytmp3/mp3/'+encodeURIComponent(data.mp3.name);
            $scope.yourtubebox.mp3_name = data.title+".mp3";
            $scope.mp3 = data;
            $analytics.eventTrack('eventName', {
                category: 'youtube-link-title', action:'converted' ,label: data.title
            });

            $timeout(function() {

                $scope.yourtubebox.processing = false;

                $scope.playing_mp3 = $scope.mp3;
                $scope.playing_mp3.url = $scope.yourtubebox.mp3_url;
                $scope.playing_mp3.url_s = $scope.yourtubebox.mp3_url_s;
                $scope.playing_mp3.url_m = encodeURIComponent( 'http://share-find.com/yourtubebox/#/V/'+data.vid );

                $scope.audioPlaylist.push({
                    src: $scope.playing_mp3.url,
                    type: 'audio/mpeg',
                    media: "",
                    title: data.mp3.name,
                    img: data.img,
                    vid: data.vid,
                    url_m: encodeURIComponent( 'http://share-find.com/yourtubebox/#/V/'+data.vid )
                });

                window.location.href = "#/app/player";
            }, 20000);


        }).error( function ( data) {
            console.log(data);
            $scope.yourtubebox.processing = false;
        });
    }

})
.controller('PlaylistCtrl', function($scope, $stateParams, $http, $filter) {

    $scope.viewList = [];
    $scope.pList = [];

    $http({method: 'GET', url: 'http://share-find.com/ytmp3/toMp3.php?mp3_list'}).
        success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.pList[2] = data.hit;
            $scope.pList[1] = data.latest;

            $scope.viewList = $scope.pList[$stateParams.playlistId];
            $scope.curretPlaylist = $filter('filter')($scope.playlists, {id: $stateParams.playlistId})[0];

            console.log($scope.curretPlaylist);
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status
    });


    $scope.doRefresh = function() {
        $http({method: 'GET', url: 'http://share-find.com/ytmp3/toMp3.php?mp3_list'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.pList[2] = data.hit;
                $scope.pList[1] = data.latest;

                $scope.viewList = $scope.pList[$stateParams.playlistId];
                $scope.curretPlaylist = $filter('filter')($scope.playlists, {id: $stateParams.playlistId})[0];

                console.log($scope.curretPlaylist);
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status
            }).
            finally(function() {
            // Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

})
