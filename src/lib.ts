export function faviconURL(u: string) {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
}

export const defaultSites = [
    { title: "GitHub", url: "https://github.com" },
    { title: "Gmail", url: "https://gmail.com" },
    { title: "Discord", url: "https://discord.com" },
    { title: "Stack Overflow", url: "https://stackoverflow.com" },
    { title: "Reddit", url: "https://reddit.com" },
];
