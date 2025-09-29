import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { faviconURL } from "../lib";

type SortedHistory = Record<number, chrome.history.HistoryItem[]>;

export default function History() {
    const [loading, setLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<chrome.history.HistoryItem[]>([]);
    const [endtime, setEndtime] = useState<number>(Date.now());
    const [more, setMore] = useState<boolean>(true);
    const ref = useRef<HTMLDivElement>(null);

    const fetchHistory = useCallback(() => {
        if (!more || loading) return;

        setLoading(true);
        chrome.runtime.sendMessage(
            {
                action: "getHistory",
                startTime: 0,
                endTime: endtime,
                maxResults: 100,
            },
            (items: chrome.history.HistoryItem[]) => {
                if (items.length === 0) {
                    setMore(false);
                    setLoading(false);
                    return;
                }

                setHistory((prev) => [...prev, ...items]);

                const oldest = items.reduce(
                    (min, item) =>
                        Math.min(min, item.lastVisitTime || Date.now()),
                    endtime
                );

                setEndtime(oldest - 1);
                setLoading(false);
            }
        );
    }, [endtime, more, loading]);

    const sortedHistory = useMemo(() => {
        const newSortedHistory: SortedHistory = {};

        for (let i = 1; i < history.length; i++) {
            const item = history[i];
            if (!item.lastVisitTime) continue;

            const date = new Date(item.lastVisitTime);
            date.setHours(0, 0, 0, 0);
            const timestamp = date.getTime();

            if (newSortedHistory[timestamp]) {
                if (
                    !newSortedHistory[timestamp].some((it) => it.id === item.id)
                ) {
                    newSortedHistory[timestamp].push(item);
                }
            } else {
                newSortedHistory[timestamp] = [item];
            }
        }

        return newSortedHistory;
    }, [history]);

    const sortedTimestamps = useMemo(() => {
        return Object.keys(sortedHistory)
            .map(Number)
            .sort((a, b) => b - a);
    }, [sortedHistory]);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!ref.current) return;
        const div = ref.current;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = div;
            if (scrollTop + clientHeight >= scrollHeight - 300 && more) {
                fetchHistory();
            }
        };

        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        div.addEventListener("scroll", throttledScroll, { passive: true });
        return () => div.removeEventListener("scroll", throttledScroll);
    }, [fetchHistory]);

    return (
        <div className="flex items-center h-full px-2 pt-4 pb-2">
            <div
                className="ml-4 pr-8 flex-1 space-y-2 h-full flex flex-col items-center overflow-y-scroll text-lg text-white bg-gray-200/10 rounded-xl p-4"
                ref={ref}
            >
                <h1 className="w-full flex justify-start items-center text-2xl py-2 text-white font-semibold border-b-2 border-gray-200">
                    History
                </h1>
                {history.length === 0 ? (
                    <p className="text-gray-400">
                        Start browsing to see history.
                    </p>
                ) : (
                    <>
                        {sortedTimestamps.map((timestamp) => (
                            <DateSection
                                key={timestamp}
                                timestamp={timestamp}
                                items={sortedHistory[timestamp]}
                            />
                        ))}
                        {loading && (
                            <p className="text-gray-400">Loading more...</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const DateSection = ({
    timestamp,
    items,
}: {
    timestamp: number;
    items: chrome.history.HistoryItem[];
}) => {
    const formattedDate = useMemo(() => {
        return new Date(timestamp).toLocaleDateString([], {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }, [timestamp]);

    const sortedItems = useMemo(() => {
        return items.sort(
            (a, b) => (b.lastVisitTime || 0) - (a.lastVisitTime || 0)
        );
    }, [items]);

    return (
        <div className="w-full border-b-2 border-gray-200 py-2">
            <h2 className="text-gray-200 font-semibold mb-2 mx-4">
                {formattedDate}
            </h2>
            <div className="space-y-1">
                {sortedItems.map((item, i) => (
                    <HistoryItem key={`${item.id}-${i}`} item={item} />
                ))}
            </div>
        </div>
    );
};

const HistoryItem = ({ item }: { item: chrome.history.HistoryItem }) => {
    const formattedTime = useMemo(() => {
        if (!item.lastVisitTime) return "";
        return new Date(item.lastVisitTime).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [item.lastVisitTime]);

    const favicon = useMemo(() => faviconURL(item.url || ""), [item.url]);

    return (
        <a
            className="w-full flex hover:bg-gray-200/20 py-2 px-4 items-center rounded-lg transition-colors duration-200 ease-in-out"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
        >
            {item.lastVisitTime && (
                <p className="w-fit text-gray-300 mr-4 text-sm">
                    {formattedTime}
                </p>
            )}
            <img className="w-6 h-6 mr-4" src={favicon} alt="" loading="lazy" />
            <p className="flex-1 truncate">{item.title || item.url}</p>
        </a>
    );
};
