chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTopSites") {
        chrome.topSites.get((sites) => {
            sendResponse(sites);
        });
        return true;
    } else if (request.action === "getBookmarks") {
        if (request.all) {
            chrome.bookmarks.search({}, (bookmarks) => {
                sendResponse(bookmarks);
            });
            return true;
        }
        chrome.bookmarks.getRecent(request.limit, (bookmarkTreeNodes) => {
            sendResponse(bookmarkTreeNodes);
        });
        return true;
    }
});
