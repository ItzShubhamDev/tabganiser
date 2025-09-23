chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === "getTopSites") {
        chrome.topSites.get((sites) => {
            sendResponse(sites);
        });
        return true;
    } else if (request === "getBookmarks") {
        chrome.bookmarks.getRecent(10, (bookmarkTreeNodes) => {
            sendResponse(bookmarkTreeNodes);
        });
        return true;
    }
});
