document.addEventListener("DOMContentLoaded", async () => {

    const data = await chrome.storage.sync.get({
        hiddenCount: 0
    });

    document.getElementById("counter").textContent =
        `非表示件数: ${data.hiddenCount}`;

    document
        .getElementById("openOptions")
        .addEventListener("click", () => {

            chrome.runtime.openOptionsPage();

        });

});