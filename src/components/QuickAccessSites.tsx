import { FaHeart } from "react-icons/fa6";
import Link from "./Link";
import { useEffect, useState } from "react";
import { defaultSites } from "../lib";

export type Site = {
    title: string;
    url: string;
};

export default function QuickAccessSites() {
    const [sites, setSites] = useState<Site[]>([]);

    useEffect(() => {
        const storedSites = localStorage.getItem("quickAccessSites");
        if (storedSites) {
            setSites(JSON.parse(storedSites));
        } else {
            setSites(defaultSites);
            localStorage.setItem(
                "quickAccessSites",
                JSON.stringify(defaultSites)
            );
        }
    }, []);

    return (
        <div className="ml-2 flex flex-col items-center justify-center h-full">
            <FaHeart className="text-pink-400 text-4xl" />
            <div className="border-y border-gray-300 w-8 mt-4 mb-2"></div>
            {sites.slice(0, 6).map((site) => (
                <Link
                    key={site.url}
                    title={site.title}
                    url={site.url}
                    type="quickaccess"
                />
            ))}
        </div>
    );
}
