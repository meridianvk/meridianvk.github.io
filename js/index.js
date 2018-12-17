// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var sched = WinJS.Utilities.Scheduler;
    var ui = WinJS.UI;
    var menuItems;

    app.version = "5.0.19.0 preview";

    app.addEventListener("activated", function (args) {
        nav.history = app.sessionState.history || {};
        nav.history.current.initialPlaceholder = true;

        // Optimize the load of the application and while the splash screen is shown, execute high priority scheduled work.
        ui.disableAnimations();

        app.vk.init();
        app.lastFm.init();
        app.player.init();

        var location;
        var isLoggedIn = false;
        if (!localStorage["session"] /*|| hasExpired(localStorage["expires"])*/) //TODO check auth here
        {
            location = "pages/login/login.html";
        }
        else {
            if (localStorage["expires"] != null && !hasExpired(localStorage["expires"])) {
                isLoggedIn = true;

                location = "pages/music/mymusic/mymusic.html";
            } else {
                app.vk.login();
                return;
            }
        }

        var searchBox = document.getElementById("searchBox");
        searchBox.onkeydown = function (e) {
            if (searchBox.value != null && e.keyCode == 13)
                nav.navigate("pages/search/search/search.html", { q: searchBox.value });
        }

        var p = ui.processAll().then(function () {
            return nav.navigate(location || Application.navigator.home, nav.state);
        }).then(function () {
            return sched.requestDrain(sched.Priority.aboveNormal + 1);
        }).then(function () {
            ui.enableAnimations();

            if (isLoggedIn) {
                app.showSidebar();
                initializeSidebar();
            }
        });

        args.setPromise(p);
    });

    nav.addEventListener("navigated", function (args) {
        if (menuItems != null) {
            menuItems.forEach(function (item, index) {
                if (item.page == WinJS.Navigation.history.current.location) {
                    var activeItem = document.querySelector(".menuItem.active");
                    if (activeItem != null)
                        WinJS.Utilities.removeClass(activeItem, "active");
                    //highlight current menu item
                    var itemsElements = document.querySelectorAll(".menuItem");
                    WinJS.Utilities.addClass(itemsElements[index], "active");
                }
            });
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };


    app.onlogin = function () {
        WinJS.Navigation.navigate("pages/music/mymusic/mymusic.html");
        WinJS.Navigation.history.backStack = [];

        app.showSidebar();

        initializeSidebar();

        processImages();
    };

    app.showSidebar = function () {
        var sidebar = document.getElementById("sidebar");
        sidebar.style.display = 'block';

        var searchBox = document.getElementById("searchWrapper");
        searchBox.style.display = 'block';
    }

    app.hideSidebar = function () {
        var sidebar = document.getElementById("sidebar");
        sidebar.style.display = 'none';

        var searchBox = document.getElementById("searchWrapper");
        searchBox.style.display = 'none';
    }

    app.start();

    function initializeSidebar() {
        menuItems = new WinJS.Binding.List([
            { title: document.l10n.getSync("myMusic"), page: "pages/music/mymusic/mymusic.html" },
            { title: document.l10n.getSync("popular"), page: "pages/music/popular/popular.html" },
            { title: document.l10n.getSync("recommendations"), page: "pages/music/recommendations/recommendations.html" },
            { title: document.l10n.getSync("people"), page: "pages/people/people/people.html" },
        ]);


        var menu = document.getElementById("menu");
        menu.winControl.itemDataSource = menuItems.dataSource;
        menu.winControl.addEventListener("loadingstatechanged", onMenuLoadingStateChanged);
        menu.winControl.forceLayout();

        menu.winControl.oniteminvoked = function (e) {
            e.detail.itemPromise.then(function (item) {
                if (WinJS.Navigation.history.current.location != item.data.page) {
                    WinJS.Navigation.navigate(item.data.page);
                }
            });
        }

        var slider = $("#progressBar");
        slider.slider({
            range: "min",
            value: 0
        });


        slider = $("#volumeBar");
        slider.slider({
            range: "min",
            max: 100,
            value: localStorage["volume"]
        });

        document.getElementById("appVersion").textContent = document.l10n.getSync("version") + " " + app.version;
    }

    function onMenuLoadingStateChanged(e) {
        var menu = document.getElementById("menu");

        //highlight first item
        var firstItem = menu.querySelector(".menuItem");
        if (firstItem != null) {
            WinJS.Utilities.addClass(firstItem, "active");

            menu.winControl.removeEventListener("loadingstatechanged", onMenuLoadingStateChanged);
        }
    }

    function hasExpired(time) {
        if (time == null)
            return false;

        return !(time * 1000 >= Date.now());
    }
})();
