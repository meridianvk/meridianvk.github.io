(function () {
    "use strict";

    WinJS.UI.Pages.define("pages/music/recommendations/recommendations.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            //pivot localization
            document.querySelector(".fragment.recommendations #audiosTab").winControl.header = document.l10n.getSync("generalTab");

            document.l10n.localizeNode(element);

            loadAudios();
        }
    });


    function loadAudios() {
        WinJS.Application.vk.audio.getRecommendations().then(function (result) {
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
