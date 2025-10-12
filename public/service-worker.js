chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTopSites") {
        chrome.topSites.get((sites) => {
            sendResponse(sites);
        });
        return true;
    } else if (request.action === "getBookmarks") {
        if (request.parentId) {
            chrome.bookmarks.getChildren(
                request.parentId,
                (bookmarkTreeNodes) => {
                    sendResponse(bookmarkTreeNodes);
                }
            );
            return true;
        }
        chrome.bookmarks.getRecent(request.limit, (bookmarkTreeNodes) => {
            sendResponse(bookmarkTreeNodes);
        });
        return true;
    } else if (request.action === "getTree") {
        chrome.bookmarks.getTree((res) => {
            sendResponse(res);
        });
        return true;
    } else if (request.action === "getHistory") {
        chrome.history.search(
            {
                text: "",
                startTime: request.startTime || 0,
                endTime: request.endTime || Date.now(),
                maxResults: request.maxResults || 100,
            },
            (historyItems) => {
                sendResponse(historyItems);
            }
        );
        return true;
    }
});
