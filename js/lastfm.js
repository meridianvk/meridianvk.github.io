(function () {
    var apiKey = "a012acc1e5f8a61bc7e58238ce3021d8";
    var apiSecret = "86776d4f43a72633fb37fb28713a7798";
    var lastfm;
    var lastFmCache = new LastFMCache();

    //last fm helper
    var LastFmHelper = WinJS.Class.define(function () {

    },
    {
        init: function () {
            lastfm = new LastFM({
                apiKey: apiKey,
                apiSecret: apiSecret,
                cache: lastFmCache
            });
        },

        getTrackImage: function (title, artist) {
            return new WinJS.Promise(function init(complete, error) {
                lastfm.track.getInfo({ track: title, artist: artist }, {
                    success: function (response) {
                        var result;
                        var track = response["track"];
                        result = getImageFromTrack(track);
                        complete(result);
                    },
                    error: function (code, message) {
                        complete("");
                    }
                });
            });
        },

        getArtistImage: function (artist) {
            return new WinJS.Promise(function init(complete, error) {
                lastfm.artist.getInfo({ artist: artist }, {
                    success: function (response) {
                        var result;
                        var artist = response["artist"];
                        result = extractImage(artist);
                        complete(result);
                    },
                    error: function (code, message) {
                        complete("");
                    }
                });
            });
        },

        getAlbums: function (album)
        {
            return new WinJS.Promise(function init(complete, error) {
                lastfm.album.search({ album: album }, {
                    success: function (response) {
                        var result;
                        if (response.results != null && response.results.albummatches != null)
                        {
                            if(Array.isArray(response.results.albummatches.album))
                                result = response.results.albummatches.album;
                            else
                                result = [ response.results.albummatches.album ];

                            for(var i = 0; i < result.length; i++)
                            {
                                result[i].coverUrl = extractImage(result[i]);
                            }
                            complete(result);
                            return;
                        }
                        complete(response); 
                    },
                    error: function (code, message) {
                        complete(message);
                    }
                });
            });
        },

        getAlbumInfo: function(mbid, album, artist)
        {
            return new WinJS.Promise(function init(complete, error) {
                lastfm.album.getInfo({mbid: mbid, album: album, artist: artist}, {
                    success: function(response)
                    {
                        complete(response); 
                    },
                    error: function (code, message) {
                        complete(message);
                    }
                });
            });
        }
    });

    function extractImage(imageContainer) {
        if (!Array.isArray(imageContainer.image)) {
            var image = imageContainer.image["#text"];
            return image;
        } else {
            for (var i = 0; i < imageContainer.image.length; i++) {
                if (imageContainer.image[i]["size"] === "extralarge") {
                    return imageContainer.image[i]["#text"];
                }
            }
        }

        return "";
    }

    function getImageFromTrack(track) {
        if (track == null)
            return "";

        var imageContainer;
        var result = "";

        if (track.album != null && track.album.image != null) {
            imageContainer = track.album;
        }

        if (imageContainer != null) {
            result = extractImage(imageContainer);
        }

        return result;
    }

    WinJS.Application.lastFm = new LastFmHelper();
})();