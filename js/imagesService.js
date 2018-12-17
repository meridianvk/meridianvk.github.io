(function () {
    var app = WinJS.Application;

    var ImagesService = WinJS.Class.define(function () {

    },
    {
        getTrackImage: function (title, artist) {
            return new WinJS.Promise(function init(complete, error) {
                app.lastFm.getTrackImage(title, artist).then(function (imageUrl) {
                    if (imageUrl) {
                        complete(imageUrl);
                    } else {
                        var artists;
                        if (artist.contains(", ")) {
                            artists = artist.split(", ");
                            if (artists.length > 0)
                                artist = artists[0];
                        }

                        if (artist.contains(" feat. ")) {
                            artists = artist.split(" feat. ");
                            if (artists.length > 0)
                                artist = artists[0];
                        }

                        if (artist.contains(" ft. ")) {
                            artists = artist.split(" ft. ");
                            if (artists.length > 0)
                                artist = artists[0];
                        }

                        app.lastFm.getArtistImage(artist).then(function (imageUrl) {
                            complete(imageUrl);
                        });
                    }
                });
            });
        },

        getArtistImage: function(artist)
        {
            return new WinJS.Promise(function init(complete, error) {
                var artists;
                if (artist.contains(", ")) {
                    artists = artist.split(", ");
                    if (artists.length > 0)
                        artist = artists[0];
                }

                if (artist.contains(" feat. ")) {
                    artists = artist.split(" feat. ");
                    if (artists.length > 0)
                        artist = artists[0];
                }

                if (artist.contains(" ft. ")) {
                    artists = artist.split(" ft. ");
                    if (artists.length > 0)
                        artist = artists[0];
                }

                app.lastFm.getArtistImage(artist).then(function (imageUrl) {
                    complete(imageUrl);
                });
            });
        }
    });

    app.imagesService = new ImagesService();
})();