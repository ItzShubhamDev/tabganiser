import Link from "./Link";
import { useEffect, useState } from "react";

type Site = {
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
            const defaultSites = [
                { title: "GitHub", url: "https://github.com" },
                { title: "Gmail", url: "https://gmail.com" },
                { title: "Discord", url: "https://discord.com" },
                { title: "Stack Overflow", url: "https://stackoverflow.com" },
                { title: "Reddit", url: "https://reddit.com" },
            ];
            setSites(defaultSites);
            localStorage.setItem(
                "quickAccessSites",
                JSON.stringify(defaultSites)
            );
        }
    }, []);

    return (
        <div className="ml-2 flex flex-col items-center justify-center h-full">
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
