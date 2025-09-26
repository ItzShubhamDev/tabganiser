import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import QuickAccessSites from "../components/QuickAccessSites";
import Link from "../components/Link";
import { FaGoogle } from "react-icons/fa6";

export default function NewTab() {
    const [time, setTime] = useState(new Date());
    const [greeting, setGreeting] = useState("");
    const [query, setQuery] = useState("");
    const [topSites, setTopSites] = useState<chrome.topSites.MostVisitedURL[]>(
        []
    );
    const [bookmarks, setBookmarks] = useState<
        chrome.bookmarks.BookmarkTreeNode[]
    >([]);
    const [searchEngine, setSearchEngine] = useState(
        "https://www.google.com/search?q="
    );

    const searchEngines = [
        { id: "b", name: "Bing", url: "https://www.bing.com/search?q=" },
        { id: "br", name: "Brave", url: "https://search.brave.com/search?q=" },
        { id: "g", name: "Google", url: "https://www.google.com/search?q=" },
        { id: "d", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
        {
            id: "sp",
            name: "Startpage",
            url: "https://www.startpage.com/do/search?q=",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setTime(now);
            const hours = now.getHours();
            if (hours < 12) {
                setGreeting("Good morning!");
            } else if (hours < 18) {
                setGreeting("Good afternoon!");
            } else {
                setGreeting("Good evening!");
            }
        });
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const defaultEngine = localStorage.getItem("defaultSearchEngine");
        if (defaultEngine) {
            const engine = searchEngines.find((e) => e.id === defaultEngine);
            if (engine) {
                setSearchEngine(engine.url);
            }
        }
        chrome.runtime.sendMessage(
            {
                action: "getTopSites",
            },
            (sites) => {
                setTopSites(sites);
            }
        );
        chrome.runtime.sendMessage(
            {
                action: "getBookmarks",
                limit: 12,
            },
            (bookmarks) => {
                setBookmarks(bookmarks);
            }
        );
    }, []);

    function formatTime(date: Date) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    return (
        <div className="w-full h-full flex justify-center items-center overflow-hidden relative">
            <QuickAccessSites />
            <div className="flex flex-col justify-center w-full h-full relative -mt-16">
                <div className="flex flex-col items-center">
                    <span className="text-2xl text-gray-200">{greeting}</span>
                    <span className="text-6xl text-gray-100 mt-12">
                        {formatTime(time)}
                    </span>
                    <span className="text-xl font-light text-gray-100 mt-2">
                        {new Intl.DateTimeFormat("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        }).format(time)}
                    </span>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (
                                query.startsWith("http://") ||
                                query.startsWith("https://")
                            ) {
                                window.location.href = query;
                            } else {
                                window.location.href = `${searchEngine}${encodeURIComponent(
                                    query
                                )}`;
                            }
                        }}
                        className="w-xl mt-12 flex justify-start items-center bg-gray-200 border border-gray-300 py-4 px-6 rounded-full"
                    >
                        <FaSearch className="left-1/2 text-gray-400 mr-4 text-xl" />
                        <input
                            type="text"
                            placeholder="Imagine, search..."
                            className="text-xl outline-none bg-transparent w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <FaGoogle className="right-1/2 text-gray-400 ml-4 text-xl" />
                    </form>
                </div>
                {bookmarks.length > 0 && (
                    <div className="w-full mx-2 flex items-center justify-center absolute -bottom-4">
                        {bookmarks.map((bookmark) => (
                            <Link
                                key={bookmark.id}
                                title={bookmark.title}
                                url={bookmark.url!}
                                type="bookmark"
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="mr-2 flex flex-col items-center justify-center h-full">
                {topSites.slice(0, 6).map((site) => (
                    <Link
                        key={site.url}
                        title={site.title}
                        url={site.url}
                        type="topsite"
                    />
                ))}
            </div>
        </div>
    );
}
