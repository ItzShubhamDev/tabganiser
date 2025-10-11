import { FaStar } from "react-icons/fa6";
import Category from "../components/Category";
import { useEffect, useMemo, useRef, useState } from "react";
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
    const processedIndexRef = useRef<number>(0);
    const isProcessingRef = useRef<boolean>(false);
    const [bookmarkTree, setBookmarkTree] = useState<
        chrome.bookmarks.BookmarkTreeNode[]
    >([]);
    // const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        chrome.runtime.sendMessage(
            {
                action: "getTree",
            },
            (tree) => {
                const flatten = (
                    nodes: chrome.bookmarks.BookmarkTreeNode[]
                ): chrome.bookmarks.BookmarkTreeNode[] => {
                    let result: chrome.bookmarks.BookmarkTreeNode[] = [];
                    for (const node of nodes) {
                        if (node.url) {
                            result.push(node);
                        }
                        if (node.children) {
                            result = result.concat(flatten(node.children));
                        }
                    }
                    return result;
                };
                const allBookmarks = flatten(tree);
                setBookmarkTree(tree);
                console.log("Bookmark Tree:", bookmarkTree, tree);
                setBookmarks(allBookmarks);
            }
        );
    }, []);

    useEffect(() => {
        const getCategory = async () => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            const categories = JSON.parse(
                localStorage.getItem("categories") || "{}"
            ) as Record<string, string>;

            let count = 0;
            const startIndex = processedIndexRef.current;

            for (let i = startIndex; i < bookmarks.length; i++) {
                const bookmark = bookmarks[i];
                if (!bookmark.url) {
                    processedIndexRef.current = i + 1;
                    continue;
                }

                try {
                    const url = new URL(bookmark.url);
                    const hostname = url.hostname;

                    const category = categories ? categories[hostname] : null;

                    if (category) {
                        setBookmarkCategory((prev) => ({
                            ...prev,
                            [hostname]: category,
                        }));
                        processedIndexRef.current = i + 1;
                    } else {
                        if (count >= 9) {
                            isProcessingRef.current = false;
                            setTimeout(getCategory, 60000);
                            return;
                        }

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

                        if (res.ok) {
                            const data = await res.json();
                            const category = data.category as string;
                            categories[hostname] = category;
                            setBookmarkCategory((prev) => ({
                                ...prev,
                                [hostname]: category,
                            }));
                            localStorage.setItem(
                                "categories",
                                JSON.stringify(categories)
                            );
                        }

                        count++;
                        processedIndexRef.current = i + 1;
                    }
                } catch (error) {
                    console.error("Failed to fetch category:", error);
                    processedIndexRef.current = i + 1;
                }
            }

            localStorage.setItem("categories", JSON.stringify(categories));
            isProcessingRef.current = false;
        };

        if (bookmarks.length > 0) {
            getCategory();
        }
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
            <div className="mx-4 pr-8 flex-1 space-y-2 h-full flex flex-col items-center overflow-y-scroll text-lg text-white bg-gray-200/10 rounded-xl p-4">
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
            <div className="w-72 h-full flex flex-col bg-gray-200/10 rounded-xl py-4 overflow-y-scroll">
                <div className="w-full flex flex-col px-4">
                    {bookmarkTree.map(
                        (node: chrome.bookmarks.BookmarkTreeNode) => (
                            <BookmarksFolders key={node.id} {...node} />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

function BookmarksFolders(node: chrome.bookmarks.BookmarkTreeNode) {
    return (
        <>
            {node.children &&
                node.children
                    .filter((n) => n.folderType != null)
                    .map((folder) => (
                        <>
                            <div className="flex flex-col">
                                <h3 className="text-gray-400 text-sm ml-1">
                                    {node.folderType}
                                </h3>
                                <h2 className="w-full h-full flex text-lg ml-1 text-white items-center my-2 p-2 bg-gray-200/10 rounded-lg hover:scale-105 transition-transform ease-in-out duration-100">
                                    {folder.title} (
                                    {folder.children?.length || 0})
                                </h2>
                            </div>
                        </>
                    ))}
            {node.children &&
                node.children
                    .filter((n) => n.folderType == null)
                    .map((folder) => (
                        <>
                            <div className="flex flex-col">
                                <h3 className="text-gray-400 text-sm ml-1">
                                    {node.folderType}
                                </h3>
                                <h2 className="w-full h-full flex text-lg ml-1 text-white items-center my-2 p-2 bg-gray-200/10 rounded-lg hover:scale-105 transition-transform ease-in-out duration-100">
                                    {folder.title} (
                                    {folder.children?.length || 0})
                                </h2>
                            </div>
                        </>
                    ))}
        </>
    );
}
