(function () {
    "use strict";
    //var currentAlbumId;

    WinJS.UI.Pages.define("pages/people/people/people.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            load();

            document.l10n.localizeNode(element);
        }
    });

    function load() {
        //pivot localization
        document.querySelector(".fragment.people #friendsTab").winControl.header = document.l10n.getSync("friendsTab");
        document.querySelector(".fragment.people #societiesTab").winControl.header = document.l10n.getSync("societiesTab");

        loadFriends();
        loadSocieties();
    }

    function loadFriends() {
        WinJS.Application.vk.friends.getFriends("photo_100").then(function(result) {
            if (result == null)
                return;

            var friendsList = new WinJS.Binding.List(result.items);
            var friendsListView = document.getElementById("friendsList");
            friendsListView.winControl.itemDataSource = friendsList.dataSource;
            friendsListView.winControl.oniteminvoked = function(e) {
                e.detail.itemPromise.then(function (item) {
                    WinJS.Navigation.navigate("pages/people/friend/friend.html", { friend: item.data });
                });
            };
        });
    }

    function loadSocieties() {
        WinJS.Application.vk.groups.getGroups("photo_100").then(function(result) {
            if (result == null)
                return;

            var societiesList = new WinJS.Binding.List(result.items);
            var societiesListView = document.getElementById("societiesList");
            if(!societiesListView.winControl)
            {
                societiesListView.winControl = new WinJS.UI.ListView(societiesListView, { layout: new WinJS.UI.GridLayout({orientation: "vertical"}), 
                    itemTemplate: document.querySelector(".societyItemTemplate")});
            }

            societiesListView.winControl.oniteminvoked = function (e) {
                e.detail.itemPromise.then(function (item) {
                    WinJS.Navigation.navigate("pages/people/society/society.html", { society: item.data });
                });
            };
            societiesListView.winControl.itemDataSource = societiesList.dataSource;
        });
    }
})();
