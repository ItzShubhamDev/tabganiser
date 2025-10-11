import { useEffect, useState } from "react";
import Header from "../components/Header";
import Bookmarks from "./BookMarks";
import NewTab from "./NewTab";
import History from "./History";

export default function Layout() {
    const [active, setActive] = useState<"newtab" | "bookmarks" | "history">(
        "newtab"
    );
    const [background, setBackground] = useState<string>("");

    useEffect(() => {
        const backgroundURL = localStorage.getItem("background");
        if (backgroundURL) {
            setBackground(backgroundURL);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("background", background);
    }, [background]);

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setBackground(reader.result as string);
                    localStorage.setItem("background", reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div
            className={`w-full h-screen flex flex-col justify-center overflow-hidden relative pt-16 bg-cover bg-center ${
                !background &&
                "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            }`}
            style={{
                backgroundImage: background ? `url(${background})` : undefined,
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <Header active={active} setActive={setActive} />
            {active === "newtab" ? (
                <NewTab />
            ) : active === "bookmarks" ? (
                <Bookmarks />
            ) : (
                <History />
            )}
        </div>
    );
}
