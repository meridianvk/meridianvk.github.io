function audioTemplateFunction(itemPromise) {
    return itemPromise.then(function (item) {
        var audioTemplate = document.querySelector(".audioItemTemplate");

        return audioTemplate.winControl.render(item.data).then(function (element) {
            element.setAttribute("audio-id", item.data.id);
            element.getElementsByClassName("duration")[0].textContent = item.data.duration != null ? item.data.duration.toString().toShortTimeString() : "";


            if (WinJS.Application.player.currentTrack != null && item.data.id == WinJS.Application.player.currentTrack.id)
                WinJS.Utilities.addClass(element.querySelector(".audioItem"), "active");

            var likeButton = element.querySelector("#like");
            likeButton.onclick = function (e) {
                if (item.data.owner_id == localStorage["userId"]) {
                    //remove
                    WinJS.Application.vk.audio.remove(item.data.id, item.data.owner_id).then(function (result) {
                        if (result != 1)
                            return;
                        var audioList = document.querySelector(".audioList");
                        var dataSource = audioList.winControl.itemDataSource;
                        var audioIndex = audioList.winControl.indexOfElement(element);
                        dataSource.list.splice(audioIndex, 1);
                    });
                } else {
                    //add
                    WinJS.Application.vk.audio.add(item.data.id, item.data.owner_id).then(function(result) {
                        if (result > 0)
                            alert(document.l10n.getSync("audioAdded"));
                    });
                }
            }

            if (item.data.owner_id == localStorage["userId"]) {
                var likeIcon = likeButton.querySelector("svg use");
                likeIcon.setAttribute("xlink:href", "img/player.svg#dislike");
            }
            var artist = element.querySelector(".artist");
            artist.onclick = function (e) {
                WinJS.Navigation.navigate("pages/search/search/search.html", { q: item.data.artist });
            };

            return element;
        });
    });
}