(function () {
    "use strict";

    WinJS.UI.Pages.define("pages/music/popular/popular.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            //pivot localization
            document.l10n.localizeNode(element);
            document.querySelector(".fragment.popular #audiosTab").winControl.header = document.l10n.getSync("audiosTab");

            loadAudios();
        }
    });


    function loadAudios() {
        WinJS.Application.vk.audio.getPopular().then(function (result) {
            if (result == null || result.length == 0)
                return;

            var audios = new WinJS.Binding.List(result);
            var audioList = document.getElementById("audioList");
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
})();
