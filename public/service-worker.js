chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === "getTopSites") {
        chrome.topSites.get((sites) => {
            sendResponse(sites);
        });
        return true; // keep the messaging channel open for async response
    }
});
