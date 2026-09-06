chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.sync.set({
        blockedUsers: [],
        blockedWords: [],
        hiddenCount: 0
    });

});