import { useState } from "react";

export default function Link({
    title,
    url,
    type,
}: {
    title: string;
    url: string;
    type: "bookmark" | "topsite" | "quickaccess";
}) {
    const [imgError, setImgError] = useState(false);

    function faviconURL(u: string) {
        const url = new URL(chrome.runtime.getURL("/_favicon/"));
        url.searchParams.set("pageUrl", u);
        url.searchParams.set("size", "32");
        return url.toString();
    }

    const translateCss =
        type === "topsite"
            ? "hover:-translate-x-2"
            : type === "quickaccess"
            ? "hover:translate-x-2"
            : "hover:-translate-y-2";

    return (
        <a
            href={url}
            className={`w-8 h-8 flex m-3 items-center transition-transform ease-in-out duration-200 ${translateCss}`}
            rel="noopener noreferrer"
        >
            {imgError ? (
                <div className="w-8 h-8 bg-gray-300 rounded-sm flex items-center justify-center text-xl font-bold text-gray-700">
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
