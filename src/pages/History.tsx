import { FaStar } from "react-icons/fa6";
import Category from "../components/Category";
import { useEffect, useRef, useState } from "react";
import { faviconURL } from "../lib";

type SortedHistory = Record<number, chrome.history.HistoryItem[]>;

export default function History() {
    const [history, setHistory] = useState<chrome.history.HistoryItem[]>([]);
    const [sortedHistory, setSortedHistory] = useState<SortedHistory>({});
    const [endtime, setEndtime] = useState<number>(Date.now());
    const [more, setMore] = useState<boolean>(true);
    const ref = useRef<HTMLDivElement>(null);

    const fetchHistory = () => {
        if (!more) return;

        chrome.runtime.sendMessage(
            {
                action: "getHistory",
                startTime: 0,
                endTime: endtime,
                maxResults: 300,
            },
            (items: chrome.history.HistoryItem[]) => {
                if (items.length === 0) {
                    setMore(false);
                    return;
                }

                setHistory((prev) => [...prev, ...items]);

                const oldest = items.reduce(
                    (min, item) =>
                        Math.min(min, item.lastVisitTime || Date.now()),
                    endtime
                );

                setEndtime(oldest - 1);
            }
        );
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!ref.current) return;
        const div = ref.current;
        console.log("Setting up scroll listener");

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = div;
            if (scrollTop + clientHeight >= scrollHeight - 300 && more) {
                fetchHistory();
            }
        };

        div.addEventListener("scroll", handleScroll);
        return () => div.removeEventListener("scroll", handleScroll);
    }, [endtime, more]);

    useEffect(() => {
        const newSortedHistory: { [key: number]: typeof history } = {};

        for (let i = 1; i < history.length; i++) {
            const item = history[i];
            const date = new Date(item.lastVisitTime!);
            date.setHours(0, 0, 0, 0);
            const timestamp = date.getTime();

            if (newSortedHistory[timestamp]) {
                newSortedHistory[timestamp].push(item);
            } else {
                newSortedHistory[timestamp] = [item];
            }
        }

        setSortedHistory((prev) => ({
            ...prev,
            ...newSortedHistory,
        }));
    }, [history]);

    return (
        <div className="flex items-center h-full px-2 pt-4 pb-2">
            <div className="w-72 h-full flex flex-col bg-gray-200/10 rounded-xl pt-8">
                <h1 className="w-full flex justify-center items-center text-2xl text-white font-semibold">
                    <FaStar className="mr-2 text-yellow-400" />
                    History
                </h1>
                <div className="w-full flex flex-col mt-4 px-6">
                    <Category title="Work" category="work" />
                    <Category title="Entertainment" category="entertainment" />
                    <Category title="Social" category="social" />
                    <Category title="News" category="news" />
                    <Category title="Shopping" category="shopping" />
                    <Category title="Tech" category="tech" />
                    <Category title="Tools" category="tools" />
                    <Category title="Others" category="others" />
                </div>
            </div>
            <div
                className="ml-4 pr-8 flex-1 space-y-2 h-full flex flex-col items-center overflow-y-scroll text-lg text-white bg-gray-200/10 rounded-xl p-4"
                ref={ref}
            >
                {history.length === 0 ? (
                    <p className="text-gray-400">
                        Start browsing to see history.
                    </p>
                ) : (
                    <>
                        {Object.keys(sortedHistory)
                            .sort((a, b) => Number(b) - Number(a))
                            .map((time) => (
                                <div key={time} className="w-full">
                                    <h2 className="text-gray-400 font-semibold mb-2">
                                        {new Date(
                                            Number(time)
                                        ).toLocaleDateString([], {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </h2>
                                    <div className="space-y-1">
                                        {datedHistory(
                                            sortedHistory[Number(time)]
                                        )}
                                    </div>
                                </div>
                            ))}
                    </>
                )}
            </div>
        </div>
    );
}

const datedHistory = (history: chrome.history.HistoryItem[]) => {
    return (
        <>
            {history.map((history, i) => (
                <a
                    className="w-full flex hover:bg-gray-200/20 py-2 px-4 items-center rounded-lg transition-colors duration-200 ease-in-out"
                    key={i}
                    href={history.url}
                    target="_blank"
                >
                    {history.lastVisitTime && (
                        <p className="w-fit text-gray-400 mr-4 text-sm">
                            {new Date(history.lastVisitTime).toLocaleString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </p>
                    )}
                    <img
                        className="w-6 h-6 mr-4"
                        src={faviconURL(history.url || "")}
                    />
                    <p className="flex-1 truncate">
                        {history.title || history.url}
                    </p>
                </a>
            ))}
        </>
    );
};
