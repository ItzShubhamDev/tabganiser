import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import QuickAccessSites from "../components/QuickAccessSites";
import Link from "../components/Link";
import { FaClock, FaStar } from "react-icons/fa6";
import { BsBing } from "react-icons/bs";
import { SiBrave, SiDuckduckgo, SiGoogle, SiStartpage } from "react-icons/si";

const searchEngines = [
    {
        id: "b",
        name: "Bing",
        url: "https://www.bing.com/search?q=",
        icon: <BsBing className="right-1/2 text-gray-400 ml-4 text-xl" />,
    },
    {
        id: "br",
        name: "Brave",
        url: "https://search.brave.com/search?q=",
        icon: <SiBrave className="right-1/2 text-gray-400 ml-4 text-xl" />,
    },
    {
        id: "g",
        name: "Google",
        url: "https://www.google.com/search?q=",
        icon: <SiGoogle className="right-1/2 text-gray-400 ml-4 text-xl" />,
    },
    {
        id: "d",
        name: "DuckDuckGo",
        url: "https://duckduckgo.com/?q=",
        icon: <SiDuckduckgo className="right-1/2 text-gray-400 ml-4 text-xl" />,
    },
    {
        id: "sp",
        name: "Startpage",
        url: "https://www.startpage.com/do/search?q=",
        icon: <SiStartpage className="right-1/2 text-gray-400 ml-4 text-xl" />,
    },
];

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
    const [searchEngine, setSearchEngine] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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
            } else {
                setSearchEngine(searchEngines[3].url);
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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                        className="relative w-xl mt-12 flex justify-start items-center bg-gray-200 border border-gray-300 py-4 px-6 rounded-full"
                    >
                        <FaSearch className="left-1/2 text-gray-400 mr-4 text-xl" />
                        <input
                            type="text"
                            placeholder="Imagine, search..."
                            className="text-xl outline-none bg-transparent w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {searchEngine && (
                            <button
                                className="focus:outline-none"
                                type="button"
                                onClick={() => setOpen(!open)}
                            >
                                {
                                    searchEngines.find(
                                        (e) => e.url === searchEngine
                                    )?.icon
                                }
                            </button>
                        )}
                        {open && (
                            <div
                                className="absolute right-0 mt-52 z-5 bg-gray-200 border border-gray-300 rounded-lg shadow-lg"
                                ref={ref}
                            >
                                {searchEngines.map((engine) => (
                                    <div
                                        key={engine.id}
                                        className="flex items-center space-x-2 p-2 pr-8 hover:bg-gray-300 cursor-pointer"
                                        onClick={() => {
                                            setSearchEngine(engine.url);
                                            localStorage.setItem(
                                                "defaultSearchEngine",
                                                engine.id
                                            );
                                            setOpen(false);
                                        }}
                                    >
                                        {engine.icon}
                                        <span className="text-gray-700">
                                            {engine.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
                {bookmarks.length > 0 && (
                    <div className="w-full mx-2 flex items-center justify-center absolute -bottom-4">
                        <FaStar className="text-yellow-400 text-4xl" />
                        <div className="border-x border-gray-300 h-8 ml-4 mr-2"></div>
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
                <FaClock className="text-gray-300 text-4xl" />
                <div className="border-y border-gray-300 w-8 mt-4 mb-2"></div>
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
