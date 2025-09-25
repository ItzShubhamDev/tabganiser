import { useEffect } from "react";

export default function Header({
    active,
    setActive,
}: {
    active: "newtab" | "bookmarks" | "history";
    setActive: React.Dispatch<
        React.SetStateAction<"newtab" | "bookmarks" | "history">
    >;
}) {
    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes("newtab")) {
            setActive("newtab");
        } else if (path.includes("bookmarks")) {
            setActive("bookmarks");
        } else if (path.includes("history")) {
            setActive("history");
        }
    }, []);

    return (
        <div className="flex w-[calc(100%-16px)] ml-2 items-center justify-center py-4 absolute top-2 z-10 bg-gray-200/10 rounded-xl">
            <div className="flex w-full max-w-72 items-center justify-between">
                <h1
                    className={`px-2 border-b-2 border-transparent text-lg transition-colors ease-in-out duration-200 hover:cursor-pointer ${
                        active === "newtab"
                            ? "text-yellow-400 border-yellow-400 hover:border-yellow-200"
                            : "text-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setActive("newtab")}
                >
                    New Tab
                </h1>
                <h1
                    className={`px-2 border-b-2 border-transparent text-lg transition-colors ease-in-out duration-200 hover:cursor-pointer ${
                        active === "bookmarks"
                            ? "text-yellow-400 border-yellow-400 hover:border-yellow-200"
                            : "text-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setActive("bookmarks")}
                >
                    Bookmarks
                </h1>
                <h1
                    className={`px-2 border-b-2 border-transparent text-lg transition-colors ease-in-out duration-200 hover:cursor-pointer ${
                        active === "history"
                            ? "text-yellow-400 border-yellow-400 hover:border-yellow-200"
                            : "text-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setActive("history")}
                >
                    History
                </h1>
            </div>
        </div>
    );
}
