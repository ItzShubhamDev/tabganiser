import { useState } from "react";
import BackgroundGradient from "../components/Background";
import Header from "../components/Header";
import Bookmarks from "./BookMarks";
import NewTab from "./NewTab";
import History from "./History";

export default function Layout() {
    const [active, setActive] = useState<"newtab" | "bookmarks" | "history">(
        "newtab"
    );

    return (
        <div className="w-full h-screen flex flex-col justify-center overflow-hidden relative pt-16">
            <BackgroundGradient />
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
