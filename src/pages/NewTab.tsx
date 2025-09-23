import { useEffect, useState } from "react";
import BackgroundGradient from "../components/Background";
import { FaSearch } from "react-icons/fa";
import QuickAccessSites from "../components/QuickAccessSites";
import Link from "../components/Link";

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
        chrome.runtime.sendMessage("getTopSites", (sites) => {
            setTopSites(sites);
        });
        chrome.runtime.sendMessage("getBookmarks", (bookmarks) => {
            setBookmarks(bookmarks);
        });
    }, []);

    function formatTime(date: Date) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    return (
        <div className="w-full h-screen flex justify-center overflow-hidden">
            <BackgroundGradient />
            <QuickAccessSites />
            <div className="flex flex-col justify-between w-full relative">
                <div className="flex flex-col items-center mt-32">
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
                                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
                                    query
                                )}`;
                            }
                        }}
                        className="w-xl mt-12 flex justify-start items-center bg-gray-200 border border-gray-300 py-4 px-4 rounded-full"
                    >
                        <FaSearch className="left-1/2 text-gray-400 mr-4 text-lg" />
                        <input
                            type="text"
                            placeholder="Search or enter address"
                            className="text-xl outline-none bg-transparent w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>
                </div>
                {bookmarks.length > 0 && (
                    <div className="w-full flex items-center justify-center mb-5">
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
            <div className="mx-8 flex flex-col items-center justify-center">
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
