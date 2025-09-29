import { FaStar } from "react-icons/fa6";
import Category from "../components/Category";
import { useEffect, useMemo, useState } from "react";
import { faviconURL } from "../lib";

const categories = [
    "work",
    "entertainment",
    "social",
    "news",
    "shopping",
    "tech",
    "tools",
    "others",
];

export default function Bookmarks() {
    const [bookmarks, setBookmarks] = useState<
        chrome.bookmarks.BookmarkTreeNode[]
    >([]);
    const [bookmarkCategory, setBookmarkCategory] = useState<
        Record<string, string>
    >({});
    const [category, setCategory] = useState<string | null>();

    useEffect(() => {
        chrome.runtime.sendMessage(
            {
                action: "getBookmarks",
                all: true,
            },
            (bookmarks) => {
                setBookmarks(bookmarks);
            }
        );
    }, []);

    useEffect(() => {
        const getCategory = async () => {
            const categories = JSON.parse(
                localStorage.getItem("categories") || "{}"
            ) as Record<string, string>;

            let count = 0;
            for (const bookmark of bookmarks) {
                if (!bookmark.url) continue;
                const url = new URL(bookmark.url);
                const hostname = url.hostname;

                const category = categories ? categories[hostname] : null;

                if (category) {
                    setBookmarkCategory((prev) => ({
                        ...prev,
                        [hostname]: category,
                    }));
                } else {
                    if (count >= 13) {
                        setTimeout(getCategory, 60000);
                        break;
                    }
                    try {
                        const res = await fetch(
                            "http://localhost:3000/category",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ url: bookmark.url }),
                            }
                        );

                        if (!res.ok) continue;

                        const data = await res.json();

                        const category = data.category as string;
                        categories[hostname] = category;
                    } catch (error) {
                        console.error("Failed to fetch category:", error);
                    }
                    count++;
                }
            }

            setBookmarkCategory((prev) => ({ ...prev, ...categories }));
            localStorage.setItem("categories", JSON.stringify(categories));
        };

        getCategory();
    }, [bookmarks]);

    const filteredBookmarks = useMemo(() => {
        if (!category || category === "all") return bookmarks;
        return bookmarks.filter((bookmark) => {
            if (!bookmark.url) return false;
            try {
                const url = new URL(bookmark.url);
                const hostname = url.hostname;
                return bookmarkCategory[hostname]?.toLowerCase() === category;
            } catch {
                return false;
            }
        });
    }, [bookmarks, category, bookmarkCategory]);

    return (
        <div className="flex items-center h-full px-2 pt-4 pb-2">
            <div className="w-72 h-full flex flex-col bg-gray-200/10 rounded-xl pt-8">
                <h1 className="w-full flex justify-center items-center text-2xl text-white font-semibold">
                    <FaStar className="mr-2 text-yellow-400" />
                    Bookmarks - {bookmarks.length}
                </h1>
                <div className="w-full flex flex-col mt-4 px-6">
                    {categories.map((cat) => (
                        <Category
                            title={cat.charAt(0).toUpperCase() + cat.slice(1)}
                            category={
                                cat as
                                    | "work"
                                    | "entertainment"
                                    | "social"
                                    | "news"
                                    | "shopping"
                                    | "tech"
                                    | "tools"
                                    | "others"
                            }
                            key={cat}
                            onClick={() => {
                                setCategory(cat === category ? null : cat);
                            }}
                            active={cat === category}
                            length={
                                bookmarks.filter((bookmark) => {
                                    if (!bookmark.url) return 0;
                                    try {
                                        const url = new URL(bookmark.url);
                                        const hostname = url.hostname;
                                        return (
                                            bookmarkCategory[
                                                hostname
                                            ]?.toLowerCase() === cat
                                        );
                                    } catch {
                                        return 0;
                                    }
                                }).length
                            }
                        />
                    ))}
                </div>
            </div>
            <div className="ml-4 pr-8 flex-1 space-y-2 h-full flex flex-col items-center overflow-y-scroll text-lg text-white bg-gray-200/10 rounded-xl p-4">
                {filteredBookmarks.length === 0 ? (
                    <p className="text-gray-400">
                        {bookmarks.length === 0
                            ? "No bookmarks found."
                            : "No bookmarks in this category."}
                    </p>
                ) : (
                    <>
                        {filteredBookmarks.map((bookmark, i) => (
                            <a
                                className="w-full flex hover:bg-gray-200/20 py-2 px-4 items-center rounded-lg transition-colors duration-200 ease-in-out"
                                key={i}
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    className="w-6 h-6 mr-4"
                                    src={faviconURL(bookmark.url || "")}
                                    alt="favicon"
                                    loading="lazy"
                                />
                                <p className="flex-1 truncate">
                                    {bookmark.title}
                                </p>
                            </a>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
