(function () {
    var progressElement;
    var playerElement;
    var currentTimeElement;
    var durationElement;
    var positionChanging = false;

    var app = WinJS.Application;

    var AudioPlayer = WinJS.Class.define(function () {

    },
    {
        init: function () {
            playerElement = document.getElementById("player");
            this.player = playerElement;
            this.player.addEventListener("timeupdate", onProgressChanged);
            this.player.addEventListener("durationchange", onDurationChanged);
            this.player.addEventListener("ended", onAudioEnded);

            this.playlist = [];
            this._originalPlaylist = [];

            progressElement = $("#progressBar");
            progressElement.slider({ slide: onSliderChanged });

            if (!localStorage["volume"])
                localStorage["volume"] = 50;

            $("#volumeBar").slider({ slide: onVolumeSliderChanged });
            playerElement.volume = localStorage["volume"] / 100;

            currentTimeElement = document.getElementById("currentTime");
            durationElement = document.getElementById("duration");

            document.getElementById("play").onclick = play;
            document.getElementById("pause").onclick = play;
            document.getElementById("next").onclick = next;
            document.getElementById("prev").onclick = prev;

            document.querySelector("#playerControl #like").onclick = likeDislike;

            var repeatButton = document.getElementById("repeat");
            repeatButton.onclick = onRepeatChanged;
            if (localStorage["repeat"] == 1) {
                WinJS.Utilities.addClass(repeatButton, "active");
            }

            var shuffleButton = document.getElementById("shuffle");
            shuffleButton.onclick = onShuffleChanged;
            if (localStorage["shuffle"] == 1) {
                WinJS.Utilities.addClass(shuffleButton, "active");
            }
        },

        playFrom: function (track) {
            this.currentTrack = track;
            if (track.url) {
                this.player.src = track.url;
                this.play();

                onTrackChanged();
            }
            else
                loadTrack(track);
        },

        play: function () {
            this.player.play();
            document.getElementById("play").setAttribute("hidden", "true");
            document.getElementById("pause").removeAttribute("hidden");
        },

        pause: function () {
            this.player.pause();
            document.getElementById("pause").setAttribute("hidden", "true");
            document.getElementById("play").removeAttribute("hidden");
        },

        next: function (force) {
            var currentIndex = this.playlist.indexOf(this.currentTrack);
            if (localStorage["repeat"] != 1 || force)
                currentIndex++;

            if (currentIndex == this.playlist.length)
                currentIndex = 0;

            if (currentIndex <= this.playlist.length - 1) {
                this.playFrom(this.playlist[currentIndex]);
            }
        },

        skipNext: function() {
            this.next(true);
        },

        prev: function () {
            if (this.position > 3) {
                this.position = 0;
                return;
            }

            var currentIndex = this.playlist.indexOf(this.currentTrack);
            currentIndex--;

            if (currentIndex < 0)
                currentIndex = this.playlist.length - 1;

            if (currentIndex >= 0) {
                this.playFrom(this.playlist[currentIndex]);
            }
        },

        currentTrack: {
            get: function () {
                return this.track;
            },
            set: function (value) {
                var oldValue = this.track;

                this.track = value;
                this.player.src = value.url;

                if (value != null) {
                    if (oldValue == null) {
                        onTrackChanged();
                    }

                    document.getElementById("currentAudioTitle").textContent = value.title;
                    document.getElementById("currentAudioArtist").textContent = value.artist;

                    durationElement.textContent = !isNaN(WinJS.Application.player.duration) ? Math.round(value.duration).toString().toShortTimeString()
                    : "0:00";
                }
            }
        },

        playlist: {
            get: function () {
                return this._playlist;
            },
            set: function (value) {
                if (localStorage["shuffle"] == 1) {
                    this._originalPlaylist = value.slice(0);
                    this._playlist = shuffle(value.slice(0));
                } else {
                    this._originalPlaylist = value;
                    this._playlist = value;
                }
            }
        },

        position: {
            get: function () {
                return playerElement.currentTime;
            },
            set: function (time) {
                if (playerElement.readyState != 0)
                    playerElement.currentTime = time;
            }
        },

        duration:
        {
            get: function () {
                return playerElement.duration;
            }
        },

        isPlaying: {
            get: function () {
                return !playerElement.paused;
            }
        }
    });

    function onProgressChanged() {
        if (positionChanging)
            return;

        currentTimeElement.textContent = Math.round(WinJS.Application.player.position).toString().toShortTimeString();
        durationElement.textContent = !isNaN(WinJS.Application.player.duration) ? Math.round(WinJS.Application.player.duration).toString().toShortTimeString()
        : "0:00";
        progressElement.slider({ value: WinJS.Application.player.position, max: WinJS.Application.player.duration });
    }

    function onDurationChanged() {
        progressElement.max = WinJS.Application.player.duration;
    }

    function play() {
        if (WinJS.Application.player.isPlaying)
            WinJS.Application.player.pause();
        else
            WinJS.Application.player.play();
    }

    function next() {
        WinJS.Application.player.skipNext();
    }

    function prev() {
        WinJS.Application.player.prev();
    }

    function likeDislike() {
        var likeIcon = document.querySelector("#playerControl #like svg use");
        var currentAudio = app.player.currentTrack;
        if (currentAudio.owner_id == localStorage["userId"]) {
            //remove
            WinJS.Application.vk.audio.remove(currentAudio.id, currentAudio.owner_id).then(function (result) {
                if (result != 1)
                    return;
                likeIcon.setAttribute("xlink:href", "img/player.svg#like");
                var audioList = document.querySelector(".fragment.mymusic .audioList");
                if (audioList != null) {
                    var dataSource = audioList.winControl.itemDataSource;
                    var audioIndex = audioList.winControl.indexOfElement(audioList.querySelector(".win-item[audio-id='" + currentAudio.id + "']"));
                    dataSource.list.splice(audioIndex, 1);
                }
            });
        } else {
            //add
            WinJS.Application.vk.audio.add(currentAudio.id, currentAudio.owner_id).then(function (result) {
                if (result > 0) {
                    currentAudio.id = result;
                    currentAudio.owner_id = localStorage["userId"];
                    likeIcon.setAttribute("xlink:href", "img/player.svg#dislike");
                    alert(document.l10n.getSync("audioAdded"));
                }
            });
        }
    }

    function onRepeatChanged() {
        var repeatButton = document.getElementById("repeat");
        if (localStorage["repeat"] == 1) {
            localStorage["repeat"] = 0;
            WinJS.Utilities.removeClass(repeatButton, "active");
        } else {
            localStorage["repeat"] = 1;
            WinJS.Utilities.addClass(repeatButton, "active");
        }
    }

    function onShuffleChanged() {
        var shuffleButton = document.getElementById("shuffle");
        if (localStorage["shuffle"] == 1) {
            localStorage["shuffle"] = 0;
            WinJS.Utilities.removeClass(shuffleButton, "active");
            app.player._playlist = app.player._originalPlaylist.slice(0); //clone original playlist
        } else {
            localStorage["shuffle"] = 1;
            WinJS.Utilities.addClass(shuffleButton, "active");
            app.player._originalPlaylist = app.player.playlist.slice(0); //clone original playlist
            app.player._playlist = shuffle(app.player.playlist);
        }
    }

    function onSliderChanged(event, ui) {
        positionChanging = true;

        WinJS.Application.player.position = ui.value;

        positionChanging = false;
    }

    function onAudioEnded() {
        WinJS.Application.player.next();
    }

    function onTrackChanged() {
        var likeIcon = document.querySelector("#playerControl #like svg use");
        if (app.player.currentTrack != null && app.player.currentTrack.owner_id == localStorage["userId"]) {
            likeIcon.setAttribute("xlink:href", "img/player.svg#dislike");
        } else {
            likeIcon.setAttribute("xlink:href", "img/player.svg#like");
        }

        var audioListElements = document.querySelectorAll(".audioList");
        if (audioListElements != null) {
            for (var i = 0; i < audioListElements.length; i++) {
                var audioListElement = audioListElements[i];
                //TODO doesn't work properly
                if (audioListElement.winControl != null) {
                    var audioIndex = audioListElement.winControl.indexOfElement(audioListElement.querySelector(".win-item[audio-id='" + app.player.currentTrack.id + "']"));
                    audioListElement.winControl.ensureVisible(audioIndex);
                }
                var currentAudioElement = audioListElement.querySelector(".audioItem.active");
                if (currentAudioElement != null)
                    WinJS.Utilities.removeClass(currentAudioElement, "active");

                currentAudioElement = audioListElement.querySelector("[audio-id='" + app.player.currentTrack.id + "']");
                if (currentAudioElement != null)
                    WinJS.Utilities.addClass(currentAudioElement.querySelector(".audioItem"), "active");
            }
        }

        if (app.player.currentTrack != null) {
            app.imagesService.getTrackImage(app.player.currentTrack.title, app.player.currentTrack.artist).then(function (imageUrl) {

                var image = "";

                if (imageUrl)
                    image = imageUrl

                var coverBlock = $('#coverBlock');
                var coverImage = $("#coverImage");

                if (coverImage.attr("src") != imageUrl) {
                    coverImage.fadeTo(150, 0, "swing", function () {
                        coverImage.attr("src", image || null);
                    });
                    coverImage.load(function () {
                        coverImage.attr("width", null);
                        coverImage.attr("height", null);

                        var h = coverImage.height();
                        var w = coverImage.width();

                        if (w < h)
                            coverImage.attr("width", "100%");
                        else
                            coverImage.attr("height", "100%");

                        coverImage.fadeTo(150, 1, "swing");
                    });
                }
            });

            app.imagesService.getArtistImage(app.player.currentTrack.artist).then(function (imageUrl) {
                document.querySelector(".backgroundArt .art").src = imageUrl || null;
            });
        }
    }

    function loadTrack(track) {
        WinJS.Application.vk.audio.getByArtistAndTitle(track.title, track.artist).then(function (result) {
            if (result == null)
                return;

            playerElement.src = result.url;
            WinJS.Application.player.play();

            onTrackChanged();
        });
    }


    function onVolumeSliderChanged(event, ui) {
        playerElement.volume = ui.value / 100;
        localStorage["volume"] = ui.value;
    }

    WinJS.Application.player = new AudioPlayer();
})();