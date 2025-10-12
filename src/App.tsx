import { useEffect, useState } from "react";
import type { Site } from "./components/QuickAccessSites";
import { defaultSites, faviconURL } from "./lib";
import { FaPlus, FaRegTrashAlt } from "react-icons/fa";

function App() {
    const [quickAccessSites, setQuickAccessSites] = useState<Site[]>([]);
    const [newSite, setNewSite] = useState<Site>({ title: "", url: "" });
    const [background, setBackground] = useState<string>("");

    useEffect(() => {
        const storedSites = localStorage.getItem("quickAccessSites");
        if (storedSites) {
            setQuickAccessSites(JSON.parse(storedSites));
        } else {
            setQuickAccessSites(defaultSites);
            localStorage.setItem(
                "quickAccessSites",
                JSON.stringify(defaultSites)
            );
        }

        chrome.storage.local.get("background", (data) => {
            if (data.background) {
                setBackground(data.background);
            }
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "quickAccessSites",
            JSON.stringify(quickAccessSites)
        );
    }, [quickAccessSites]);

    useEffect(() => {
        chrome.storage.local.set({ background }, () => {
            if (chrome.runtime.lastError) {
                console.error(
                    "Failed to save background:",
                    chrome.runtime.lastError
                );
            }
        });
    }, [background]);

    function deleteSite(url: string) {
        setQuickAccessSites((prevSites) =>
            prevSites.filter((site) => site.url !== url)
        );
    }

    function addSite(site: Site) {
        if (
            site.title &&
            site.url &&
            !quickAccessSites.find((s) => s.url === site.url)
        ) {
            try {
                new URL(site.url);
                setQuickAccessSites((prevSites) => [...prevSites, site]);
                setNewSite({ title: "", url: "" });
            } catch {
                // Invalid URL
            }
        }
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setBackground(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    return (
        <div
            className={`w-lg h-fit flex flex-col justify-top bg-cover bg-center ${
                !background &&
                "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            }`}
            style={{
                backgroundImage: background ? `url(${background})` : undefined,
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="p-4 text-lg text-gray-300">
                <h1 className="text-3xl text-gray-200 font-semibold mb-4">
                    Tabganiser
                </h1>
                Organize your tabs with ease.
                <ul>
                    <li className="list-disc list-inside">
                        Add your favorite websites for quick access.
                    </li>
                    <li className="list-disc list-inside">
                        Click on the favicon to visit the site.
                    </li>
                    <li className="list-disc list-inside">
                        Edit the title and URL directly.
                    </li>
                    <li className="list-disc list-inside">
                        Remove sites you no longer need.
                    </li>
                </ul>
                <h1 className="text-xl text-gray-200 font-semibold my-2">
                    Manage Quick Access Sites
                </h1>
            </div>
            <div className="w-lg h-[320px] p-4 pt-1 overflow-y-scroll flex flex-col space-y-2">
                {quickAccessSites.map((site, i) => (
                    <div
                        className="w-full flex items-center text-base space-x-2"
                        key={i}
                    >
                        <div className="min-w-6 aspect-square ring ring-gray-200 rounded-md p-2">
                            <img
                                src={faviconURL(site.url)}
                                alt="favicon"
                                className="w-6 h-6"
                            />
                        </div>
                        <input
                            className="w-24 text-gray-200 truncate focus:outline-none ring ring-gray-200 rounded-md p-2"
                            value={site.title}
                            onChange={(e) => {
                                const updatedTitle = e.target.value;
                                setQuickAccessSites((prevSites) =>
                                    prevSites.map((s) =>
                                        s.url === site.url
                                            ? { ...s, title: updatedTitle }
                                            : s
                                    )
                                );
                            }}
                        />
                        <input
                            className="flex-1 text-gray-200 truncate focus:outline-none ring ring-gray-200 rounded-md p-2"
                            value={site.url}
                            onChange={(e) => {
                                const updatedURL = e.target.value;
                                setQuickAccessSites((prevSites) =>
                                    prevSites.map((s) =>
                                        s.url === site.url
                                            ? { ...s, url: updatedURL }
                                            : s
                                    )
                                );
                            }}
                        />
                        <button
                            className="w-fit text-red-400 hover:cursor-pointer ring ring-gray-200 rounded-md p-2 hover:bg-red-200/20"
                            onClick={() => deleteSite(site.url)}
                        >
                            <FaRegTrashAlt size={24} />
                        </button>
                    </div>
                ))}
                <div className="w-full flex items-center text-base space-x-2">
                    <div className="min-w-6 aspect-square ring ring-gray-200 rounded-md p-2">
                        <img
                            src={faviconURL("chrome://favicon")}
                            alt="favicon"
                            className="w-6 h-6"
                        />
                    </div>
                    <input
                        className="w-24 text-gray-200 truncate focus:outline-none ring ring-gray-200 rounded-md p-2"
                        value={newSite.title}
                        onChange={(e) =>
                            setNewSite((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))
                        }
                    />
                    <input
                        className="flex-1 text-gray-200 truncate focus:outline-none ring ring-gray-200 rounded-md p-2"
                        value={newSite.url}
                        onChange={(e) =>
                            setNewSite((prev) => ({
                                ...prev,
                                url: e.target.value,
                            }))
                        }
                    />
                    <button
                        className="w-fit text-green-400 hover:cursor-pointer ring ring-gray-200 rounded-md p-2 hover:bg-green-200/20"
                        onClick={() => addSite(newSite)}
                    >
                        <FaPlus size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
