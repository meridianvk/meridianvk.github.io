(function () {
    "use strict";
    //var currentAlbumId;

    WinJS.UI.Pages.define("pages/music/mymusic/mymusic.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            initializeListsViews();
            load();

            document.l10n.localizeNode(element);
        }
    });

    function initializeListsViews() {
        //artists list
        var artistsList = document.getElementById("artistsList");
        var artistsListView = new WinJS.UI.ListView(artistsList, { layout: new WinJS.UI.ListLayout() });
        artistsListView.oniteminvoked = function (e) {
            e.detail.itemPromise.then(function (item) {
                var currentArtistId = albumListHighlightCurrentItem(item, artistsList, e);
                if (currentArtistId != item.data.id) {
                    loadArtistAudios(item.data.tracks);
                }
            });
        };

        //initialize artists audios list
        var artistAudioList = document.getElementById("artistAudioList");
        var artistAudiosListView = new WinJS.UI.ListView(artistAudioList, { layout: new WinJS.UI.ListLayout() });

    }

    function load() {
        var pivot = document.getElementById("pivot");
        pivot.winControl.onselectionchanged = onPivotSelectionChanged;

        //pivot localization
        document.querySelector(".fragment.mymusic #audiosTab").winControl.header = document.l10n.getSync("audiosTab");
        document.querySelector(".fragment.mymusic #artistsTab").winControl.header = document.l10n.getSync("artistsTab");
        document.querySelector(".fragment.mymusic #wallTab").winControl.header = document.l10n.getSync("wallTab");

        WinJS.Application.vk.audio.getAlbums().then(function (result) {
            var list = [{ title: document.l10n.getSync("allAudios"), id: 0 }];
            if (result != null)
                list.pushArray(result.items);

            loadAudios(list[0].id);

            var albums = new WinJS.Binding.List(list);

            var albumsList = document.getElementById("albumsList");
            albumsList.winControl.addEventListener("loadingstatechanged", onAlbumsLoadingStateChanged);
            albumsList.winControl.itemTemplate = albumTemplateFunction;
            albumsList.winControl.itemDataSource = albums.dataSource;
            albumsList.winControl.oniteminvoked = function (e) {
                e.detail.itemPromise.then(function (item) {
                    var currentAlbumId = albumListHighlightCurrentItem(item, albumsList, e);
                    if (currentAlbumId != item.data.id) {
                        loadAudios(item.data.id);
                    }
                });
            };
        });
    }

    function onPivotSelectionChanged(e) {
        if (e.detail.index == 2) //wall
        {
            loadWallAudio();
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


    function onArtistsLoadingStateChanged(e) {
        var artists = document.getElementById("artistsList");

        //highlight first item
        var firstItem = artists.querySelector(".albumItem");
        if (firstItem != null) {
            WinJS.Utilities.addClass(firstItem, "active");

            artists.winControl.removeEventListener("loadingstatechanged", onAlbumsLoadingStateChanged);
        }
    }

    function loadAudios(albumId) {
        //currentAlbumId = albumId;

        WinJS.Application.vk.audio.getAudio(albumId).then(function (result) {
            if (result == null || result.length == 0)
                return;

            if (WinJS.Application.player.currentTrack == null)
                WinJS.Application.player.currentTrack = result.items[0];

            if (WinJS.Application.player.playlist == null || WinJS.Application.player.playlist.length == 0)
                WinJS.Application.player.playlist = result.items;

            var audios = new WinJS.Binding.List(result.items);

            var audioListView = document.getElementById("audioList");
            if(!audioListView.winControl)
            {
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

            var artists = loadArtistsFromTracks(result.items);
            artists.sort(function (a, b) { return a.title < b.title ? -1 : (a.title > b.title ? 1 : 0) });

            if (artists.length > 0)
                loadArtistAudios(artists[0].tracks);

            artists = new WinJS.Binding.List(artists);

            var artistsList = document.getElementById("artistsList");
            artistsList.winControl.addEventListener("loadingstatechanged", onArtistsLoadingStateChanged);
            artistsList.winControl.itemDataSource = artists.dataSource;
            artistsList.winControl.itemTemplate = albumTemplateFunction;
        });
    }

    function loadArtistsFromTracks(tracks) {
        var artists = {};
        for (var i = 0; i < tracks.length; i++) {
            var t = tracks[i];
            var artist = t.artist;
            if (!artist)
                continue;

            var id = artist.toLowerCase().hashCode().toString();
            if (artists[id] == null) {
                artists[id] = { id: id, title: artist, tracks: [] };
            }

            artists[id].tracks.push(t);
        }

        return Object.keys(artists).map(function (key) { return artists[key] });
    }

    function loadArtistAudios(tracks) {
        var audios = new WinJS.Binding.List(tracks);
        var audioList = document.getElementById("artistAudioList");

        audioList.winControl.itemTemplate = audioTemplateFunction;
        audioList.winControl.itemDataSource = audios.dataSource;
        audioList.winControl.oniteminvoked = function (e) {
            e.detail.itemPromise.then(function (item) {
                WinJS.Application.player.playFrom(item.data);
                WinJS.Application.player.playlist = tracks;
            });
        };
    }

    function loadWallAudio() {
        WinJS.Application.vk.wall.getWall(0, 100, "all").then(function(result) {
            if (result == null || result.count == 0)
                return;

            var wallPosts = result.items;
            var audioIds = [];

            for (var i = 0; i < wallPosts.length; i++)
            {
                 var vkWallPost = wallPosts[i];

                 var attachments = vkWallPost.attachments;
                 if ((attachments == null || attachments.count == 0) && (vkWallPost.copy_history != null && vkWallPost.copy_history.count > 0))
                 {
                    attachments = vkwallPost.copyHistory[vkwallPost.copy_history.count - 1].Attachments;
                 }

                 if (attachments != null)
                 {
                    for (var j = 0; j < attachments.length; j++) {
                        if (attachments[j].type === "audio") {
                            audioIds.push(attachments[j].audio.owner_id + "_" + attachments[j].audio.id);
                        }
                    }
                 }
            }


            if (audioIds.length > 0) {
                WinJS.Application.vk.audio.getById(audioIds).then(function(result) {
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
