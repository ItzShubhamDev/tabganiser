import {
    FaBox,
    FaBriefcase,
    FaCartShopping,
    FaComputer,
    FaNewspaper,
    FaPhotoFilm,
    FaToolbox,
    FaUsers,
} from "react-icons/fa6";

const iconMap = {
    work: {
        icon: <FaBriefcase />,
        color: "text-cyan-500",
    },
    entertainment: {
        icon: <FaPhotoFilm />,
        color: "text-purple-500",
    },
    social: {
        icon: <FaUsers />,
        color: "text-teal-500",
    },
    news: {
        icon: <FaNewspaper />,
        color: "text-orange-500",
    },
    shopping: {
        icon: <FaCartShopping />,
        color: "text-green-500",
    },
    tech: {
        icon: <FaComputer />,
        color: "text-yellow-500",
    },
    tools: {
        icon: <FaToolbox />,
        color: "text-blue-500",
    },
    others: {
        icon: <FaBox />,
        color: "text-gray-300",
    },
};

export default function Category({
    title,
    category,
}: {
    title: string;
    category: keyof typeof iconMap;
}) {
    return (
        <div
            className={`w-full h-full flex text-2xl items-center my-2 p-2 space-x-4 bg-gray-200/10 rounded-lg hover:scale-110 transition-transform ease-in-out duration-100 ${iconMap[category].color}`}
        >
            <div>{iconMap[category].icon || <FaBox />}</div>
            <h1 className="text-lg font-semibold">{title}</h1>
        </div>
    );
}
