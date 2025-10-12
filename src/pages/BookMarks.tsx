import { FaFolder, FaStar } from "react-icons/fa6";
import Category from "../components/Category";
import { useEffect, useMemo, useRef, useState } from "react";
import { faviconURL } from "../lib";
import { FaSearch } from "react-icons/fa";

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
    const [selected, setSelected] = useState<string | null>(null);
    const [count, setCount] = useState(0);
    const [query, setQuery] = useState("");
    const [queryResults, setQueryResults] = useState<
        chrome.bookmarks.BookmarkTreeNode[]
    >([]);

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

    useEffect(() => {
        chrome.runtime.sendMessage(
            {
                action: "getTree",
            },
            (tree) => {
                const allBookmarks = flatten(tree);
                setCount(allBookmarks.length);
                setBookmarkTree(tree);
                setBookmarks(allBookmarks);
            }
        );
    }, []);

    useEffect(() => {
        if (!selected) {
            setBookmarks(flatten(bookmarkTree));
            return;
        } else {
            chrome.runtime.sendMessage(
                { action: "getBookmarks", parentId: selected },
                (nodes: chrome.bookmarks.BookmarkTreeNode[]) => {
                    const allBookmarks = flatten(nodes);
                    console.log(allBookmarks);
                    setBookmarks(allBookmarks);
                }
            );
        }
    }, [selected]);

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

    const getFolders = (node: chrome.bookmarks.BookmarkTreeNode[]) => {
        let result: chrome.bookmarks.BookmarkTreeNode[] = [];
        for (const n of node) {
            if (!n.url && n.children && n.children.length > 0) {
                result.push(n);
            }
            if (n.children) {
                result = result.concat(getFolders(n.children));
            }
        }
        return result;
    };

    const folders = useMemo(() => {
        return getFolders(bookmarkTree);
    }, [bookmarks]);

    useEffect(() => {
        if (query.trim() === "") {
            setQueryResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = bookmarks.filter(
            (bookmark) =>
                bookmark.title.toLowerCase().includes(lowerQuery) ||
                bookmark.url?.toLowerCase().includes(lowerQuery)
        );
        setQueryResults(results);
    }, [query, bookmarks]);

    return (
        <div className="flex items-center h-full px-2 pt-4 pb-2">
            <div className="w-72 h-full flex flex-col bg-gray-200/10 rounded-xl pt-8">
                <h1 className="w-full flex justify-center items-center text-2xl text-white font-semibold">
                    <FaStar className="mr-2 text-yellow-400" />
                    Bookmarks - {count}
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
            <div className="mx-4 flex-1 space-y-2 h-full flex flex-col items-center overflow-y-scroll text-lg text-white bg-gray-200/10 rounded-xl p-4">
                <div className="w-full rounded-full px-4 py-2 bg-gray-200/10 flex items-center">
                    <input
                        type="text"
                        className="bg-transparent flex-1 outline-none px-2 text-white"
                        placeholder="Search bookmarks..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <FaSearch width={32} height={32} />
                </div>
                {query && (
                    <>
                        {queryResults.length === 0 ? (
                            <p className="text-gray-400 mt-2">
                                No results found.
                            </p>
                        ) : (
                            queryResults.map((bookmark, i) => (
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
                            ))
                        )}
                    </>
                )}
                {folders.length > 0 &&
                    !query &&
                    selected &&
                    folders
                        .filter((f) => f.parentId == selected)
                        .map((folder, i) => (
                            <div
                                className="w-full flex hover:bg-gray-200/20 py-2 px-4 items-center rounded-lg transition-colors duration-200 ease-in-out"
                                key={i}
                                onClick={() => setSelected(folder.id)}
                            >
                                <FaFolder className="w-6 h-6 mr-4" />
                                <p className="flex-1 truncate">
                                    {folder.title.length > 0
                                        ? folder.title
                                        : "Bookmarks"}
                                </p>
                            </div>
                        ))}
                {filteredBookmarks.length === 0 ? (
                    <p className="text-gray-400">
                        {bookmarks.length === 0 && folders.length === 0
                            ? "No bookmarks found."
                            : folders.length == 0 &&
                              "No bookmarks in this category."}
                    </p>
                ) : (
                    <>
                        {!query &&
                            filteredBookmarks.map((bookmark, i) => (
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
                            <BookmarksFolders
                                key={node.id}
                                node={node}
                                selected={selected}
                                onClick={setSelected}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

function BookmarksFolders({
    node,
    selected,
    onClick,
    parentName,
}: {
    node: chrome.bookmarks.BookmarkTreeNode;
    selected: string | null;
    onClick: (id: string | null) => void;
    parentName?: string;
}) {
    const filtered = node.children?.filter(
        (f) => f.children !== undefined && f.children.length > 0
    );
    return (
        <>
            {node.children &&
                node.children.length > 0 &&
                filtered?.map((folder) => (
                    <>
                        {folder.title && (
                            <div
                                className={`flex flex-col my-2 p-2 bg-gray-200/10 rounded-lg hover:scale-105 hover:cursor-pointer transition-transform ease-in-out duration-100 ${
                                    selected === folder.id &&
                                    "bg-gray-200/20 scale-105"
                                }`}
                                onClick={() => {
                                    onClick(
                                        folder.id === selected
                                            ? null
                                            : folder.id
                                    );
                                }}
                            >
                                <h3 className="text-gray-400 text-xs ml-1">
                                    {parentName && `${parentName} > `}
                                    {node.title}
                                </h3>
                                <h2 className="w-full h-full flex text-lg ml-1 text-white items-center">
                                    {folder.title} (
                                    {folder.children?.length || 0})
                                </h2>
                            </div>
                        )}
                        {folder.children && folder.children.length > 0 && (
                            <BookmarksFolders
                                node={folder}
                                parentName={`${
                                    parentName ? parentName + " > " : ""
                                }${node.title}`}
                                key={folder.id}
                                selected={selected}
                                onClick={onClick}
                            />
                        )}
                    </>
                ))}
        </>
    );
}
