(function () {
    var appId = "4204225";
    var apiVersion = "5.12";

    //vk helper
    var vk = WinJS.Class.define(function () {

    },
    {
        init: function () {
            var hash = window.location.hash;
            if (hash != null && hash.length > 0) {
                hash = hash.substring(1);

                var p = parseQuery(hash);
                if (p["access_token"] != null) {
                    localStorage["session"] = p["access_token"];
                    localStorage["expires"] = Date.now() + p["expires_in"];
                    localStorage["userId"] = p["user_id"];

                    window.location.href = window.location.href.split('#')[0];
                }
            }

            VK.init({
                apiId: appId
            });
        },

        login: function () {
            var url = "http://oauth.vk.com/authorize?client_id=" + appId + "&scope=friends,audio,wall&redirect_uri=http://" + window.location.host + "&response_type=token&v=" + apiVersion;
            window.location.href = url;

            //VK.Auth.login(function (response) {
            //    if (response.session) {
            //        localStorage["session"] = response.session["sid"];
            //        localStorage["expires"] = response.session["expire"];
            //        localStorage["userId"] = response.session.user["id"];
            //WinJS.Application.onlogin();
            //    };
            //});
        },

        audio: {
            getAudio: function (albumId, ownerId) {
                var options = { album_id: albumId };
                if (ownerId)
                    options.owner_id = ownerId;
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.get", signMethod(options), function (response) {
                        complete(response["response"]);
                    });
                });
            },

            getAlbums: function (ownerId) {
                var options = {};
                if (ownerId)
                    options.owner_id = ownerId;
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.getAlbums", signMethod(options), function (response) {
                        complete(response["response"]);
                    });
                });
            },

            search: function (q, count) {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.search", signMethod({ q: q, count: count }), function (response) {
                        complete(response["response"]);
                    });
                });
            },

            getPopular: function () {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.getPopular", signMethod(), function (response) {
                        complete(response["response"]);
                    });
                });
            },

            getRecommendations: function () {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.getRecommendations", signMethod(), function (response) {
                        complete(response["response"]["items"]);
                    });
                });
            },

            getById: function (audios) {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.getById", signMethod({ audios: audios }), function (response) {
                        complete(response["response"]);
                    });
                });
            },

            add: function (audioId, ownerId) {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.add", signMethod({ audio_id: audioId, owner_id: ownerId }), function (response) {
                        complete(response["response"]);
                    });
                });
            },

            remove: function (audioId, ownerId) {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("audio.delete", signMethod({ audio_id: audioId, owner_id: ownerId }), function (response) {
                        complete(response["response"]);
                    });
                });
            },

            getByArtistAndTitle: function (title, artist) {
                return this.search(artist + "-" + title, 10).then(function (result) {
                    result = result.items;
                    if (result != null && result.length > 0) {
                        var audio;
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].title.toLowerCase() == title.toLowerCase() && result[i].artist.toLowerCase() == artist.toLowerCase())
                                audio = result[i];
                        }

                        if (audio == null) {
                            for (var i = 0; i < result.length; i++) {
                                if (result[i].title.toLowerCase() == title.toLowerCase())
                                    audio = result[i];
                            }
                        }

                        if (audio == null)
                            audio = result[0];

                        return audio;
                    }

                    return null;
                });
            },
        },

        news: {
            getNews: function (offset, count) {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("newsfeed.get", signMethod({ count: count, offset: offset }), function (response) {
                        complete(response["response"]);
                    });
                });
            }
        },

        wall: {
            getWall: function (offset, count, filter, ownerId) {
                var options = { offset: offset, count: count, filter: filter };
                if (ownerId)
                    options.owner_id = ownerId;
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("wall.get", signMethod(options), function (response) {
                        complete(response["response"]);
                    });
                });
            }
        },

        friends: {
            getFriends: function (fields) {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("friends.get", signMethod({ fields: fields }), function (response) {
                        complete(response["response"]);
                    });
                });
            }
        },

        groups: {
            getGroups: function (fields) {
                return new WinJS.Promise(function init(complete, error) {
                    VK.api("groups.get", signMethod({ fields: fields, extended: 1 }), function (response) {
                        complete(response["response"]);
                    });
                });
            }
        }
    });

    function signMethod(parameters) {
        var result = parameters || {};
        result["v"] = apiVersion;
        result["access_token"] = localStorage["session"];

        return result;
    }

    WinJS.Application.vk = new vk();
})();