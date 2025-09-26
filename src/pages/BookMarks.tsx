import { FaStar } from "react-icons/fa6";
import BookmarksCategory from "../components/BookmarksCategory";
import { useEffect, useState } from "react";
import { faviconURL } from "../lib";

export default function Bookmarks() {
    const [bookmarks, setBookmarks] = useState<
        chrome.bookmarks.BookmarkTreeNode[]
    >([]);

    useEffect(() => {
        chrome.runtime.sendMessage(
            {
                action: "getBookmarks",
                all: true,
            },
            (bookmarks) => {
                console.log(bookmarks);
                setBookmarks(bookmarks);
            }
        );
    }, []);

    return (
        <div className="flex items-center h-full px-2 pt-4 pb-2">
            <div className="w-72 h-full flex flex-col bg-gray-200/10 rounded-xl pt-8">
                <h1 className="w-full flex justify-center items-center text-2xl text-white font-semibold">
                    <FaStar className="mr-2 text-yellow-400" />
                    Bookmarks
                </h1>
                <div className="w-full flex flex-col mt-4 px-6">
                    <BookmarksCategory title="Work" category="work" />
                    <BookmarksCategory
                        title="Entertainment"
                        category="entertainment"
                    />
                    <BookmarksCategory title="Social" category="social" />
                    <BookmarksCategory title="News" category="news" />
                    <BookmarksCategory title="Shopping" category="shopping" />
                    <BookmarksCategory title="Tech" category="tech" />
                    <BookmarksCategory title="Tools" category="tools" />
                    <BookmarksCategory title="Others" category="others" />
                </div>
            </div>
            <div className="ml-4 pr-8 flex-1 space-y-2 h-full flex flex-col items-center overflow-y-scroll text-lg text-white bg-gray-200/10 rounded-xl p-4">
                {bookmarks.length === 0 ? (
                    <p className="text-gray-400">No bookmarks found.</p>
                ) : (
                    <>
                        {bookmarks.map((bookmark, i) => (
                            <a
                                className="w-full flex hover:bg-gray-200/20 py-2 px-4 items-center rounded-lg transition-colors duration-200 ease-in-out"
                                key={i}
                                href={bookmark.url}
                            >
                                <img
                                    className="w-6 h-6 mr-4"
                                    src={faviconURL(bookmark.url || "")}
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
