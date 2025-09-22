import { useState } from "react";

export default function TopSite({
    title,
    url,
}: {
    title: string;
    url: string;
}) {
    const [imgError, setImgError] = useState(false);

    function faviconURL(u: string) {
        const url = new URL(chrome.runtime.getURL("/_favicon/"));
        url.searchParams.set("pageUrl", u);
        url.searchParams.set("size", "32");
        return url.toString();
    }

    return (
        <a
            href={url}
            className="flex flex-col items-center text-gray-200 hover:text-white hover:-translate-x-2 transition-transform ease-in-out duration-200"
            rel="noopener noreferrer"
        >
            {imgError ? (
                <div className="w-10 h-10 bg-gray-300 rounded-sm flex items-center justify-center text-xl font-bold text-gray-700">
                    {title.charAt(0).toUpperCase()}
                </div>
            ) : (
                <img
                    src={faviconURL(url)}
                    alt={title.split(" ")[0]}
                    width="32"
                    height="32"
                    onError={() => setImgError(true)}
                />
            )}
        </a>
    );
}
