import { FaStar } from "react-icons/fa6";

export default function Bookmarks() {
    return (
        <div className="flex items-center h-full">
            <div className="w-64 h-full">
                <h1 className="w-full flex justify-center text-2xl text-white font-semibold">
                    <FaStar className="mt-1 mr-2 text-yellow-400" />
                    Bookmarks
                </h1>
            </div>
            <div className="flex-1 h-full flex items-center justify-center">
                <h1 className="text-2xl text-gray-400">No bookmarks yet</h1>
            </div>
        </div>
    );
}
