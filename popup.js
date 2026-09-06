document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("openOptions")
        .addEventListener("click", () => {

            chrome.runtime.openOptionsPage();

        });

});
