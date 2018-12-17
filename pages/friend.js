(function () {
    "use strict";
    //var currentAlbumId;
    var friend;

    WinJS.UI.Pages.define("pages/people/friend/friend.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            document.l10n.localizeNode(element);

            document.querySelector(".friend .titlearea").textContent = options.friend.first_name;

            var pivot = document.querySelector(".friend #pivot");
            pivot.winControl.onselectionchanged = onPivotSelectionChanged;

            friend = options.friend;

            load(options.friend);
        }
    });

    function load(friend) {
        WinJS.Application.vk.audio.getAlbums(friend.id).then(function (result) {
            var list = [{ title: document.l10n.getSync("allAudios"), id: 0 }];
            if (result != null)
                list.pushArray(result.items);

            loadAudios(list[0].id, friend.id);

            var albums = new WinJS.Binding.List(list);

            var albumsList = document.getElementById("albumsList");
            albumsList.winControl.addEventListener("loadingstatechanged", onAlbumsLoadingStateChanged);
            albumsList.winControl.itemTemplate = albumTemplateFunction;
            albumsList.winControl.itemDataSource = albums.dataSource;
            albumsList.winControl.oniteminvoked = function (e) {
                e.detail.itemPromise.then(function (item) {
                    var currentAlbumId = albumListHighlightCurrentItem(item, albumsList, e);
                    if (currentAlbumId != item.data.id) {
                        loadAudios(item.data.id, friend.id);
                    }
                });
            };
        });
    }

    function onPivotSelectionChanged(e) {
        if (e.detail.index == 1) //wall
        {
            loadWallAudio(friend.id);
        }
    }

    function onAlbumsLoadingStateChanged(e) {
        var albums = document.getElementById("albumsList");

        //highlight first item
        var firstItem = albums.querySelector(".albumItem");
        if (firstItem != null) {
            WinJS.Utilities.addClass(firstItem, "active");

            albums.winControl.removeEventListener("loadingstatechanged", onAlbumsLoadingStateChanged);
        }
    }

    function loadAudios(albumId, friendId) {
        //currentAlbumId = albumId;

        WinJS.Application.vk.audio.getAudio(albumId, friendId).then(function (result) {
            if (result == null || result.length == 0)
                return;

            if (WinJS.Application.player.currentTrack == null)
                WinJS.Application.player.currentTrack = result.items[0];

            if (WinJS.Application.player.playlist == null || WinJS.Application.player.playlist.length == 0)
                WinJS.Application.player.playlist = result.items;

            var audios = new WinJS.Binding.List(result.items);

            var audioListView = document.getElementById("audioList");
            if (!audioListView.winControl) {
                audioListView.winControl = new WinJS.UI.ListView(audioListView);
            }
            audioListView.winControl.itemTemplate = audioTemplateFunction;
            audioListView.winControl.itemDataSource = audios.dataSource;
            audioListView.winControl.oniteminvoked = function (e) {
                e.detail.itemPromise.then(function (item) {
                    WinJS.Application.player.playFrom(item.data);
                    WinJS.Application.player.playlist = result.items;
                });
            };
        });
    }

    function loadWallAudio(friendId) {
        WinJS.Application.vk.wall.getWall(0, 100, "all", friendId).then(function (result) {
            if (result == null || result.count == 0)
                return;

            var wallPosts = result.items;
            var audioIds = [];

            for (var i = 0; i < wallPosts.length; i++) {
                var vkWallPost = wallPosts[i];

                var attachments = vkWallPost.attachments;
                if ((attachments == null || attachments.count == 0) && (vkWallPost.copy_history != null && vkWallPost.copy_history.count > 0)) {
                    attachments = vkwallPost.copyHistory[vkwallPost.copy_history.count - 1].Attachments;
                }

                if (attachments != null) {
                    for (var j = 0; j < attachments.length; j++) {
                        if (attachments[j].type === "audio") {
                            audioIds.push(attachments[j].audio.owner_id + "_" + attachments[j].audio.id);
                        }
                    }
                }
            }


            if (audioIds.length > 0) {
                WinJS.Application.vk.audio.getById(audioIds).then(function (result) {
                    if (result == null)
                        return;

                    var audios = new WinJS.Binding.List(result);
                    var audioList = document.getElementById("wallAudioList");

                    audioList.winControl.itemTemplate = audioTemplateFunction;
                    audioList.winControl.itemDataSource = audios.dataSource;
                    audioList.winControl.oniteminvoked = function (e) {
                        e.detail.itemPromise.then(function (item) {
                            WinJS.Application.player.playFrom(item.data);
                            WinJS.Application.player.playlist = result;
                        });
                    };
                });
            }
        });
    }
})();
