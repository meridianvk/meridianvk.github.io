function albumTemplateFunction(itemPromise) {
    return itemPromise.then(function (item) {
        var albumTemplate = document.querySelector(".albumItemTemplate");

        return albumTemplate.winControl.render(item.data).then(function (element) {
            element.setAttribute("album-id", item.data.id);
            return element;
        });
    });
}

function albumListHighlightCurrentItem(item, albumsList, e)
{
    var currentAlbumId = albumsList.getAttribute("currentAlbumId") || 0;
                        if (currentAlbumId != item.data.id) {
                            var element = albumsList.querySelector(".albumItem.active");
                            if (element != null)
                                WinJS.Utilities.removeClass(element, "active");

                            element = e.srcElement.querySelector(".albumItem");
                            if (element != null) {
                                WinJS.Utilities.addClass(element, "active");
                            }

                            albumsList.setAttribute("currentAlbumId", item.data.id);
                        }

                        return currentAlbumId;
}