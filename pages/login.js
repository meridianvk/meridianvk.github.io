// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("pages/login/login.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            document.l10n.localizeNode(element);

        	WinJS.Application.hideSidebar();
            var loginButton = document.getElementById("loginButton");
            loginButton.onclick = function () {

                WinJS.Application.vk.login();
                //WinJS.Application.onlogin(); //WinJS.Navigation.navigate("./pages/home/home.html");
            }
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();
