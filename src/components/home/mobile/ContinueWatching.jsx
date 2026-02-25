import React from "react";

const continueWatchingData = [
    {
        title: "One Piece",
        image: "https://v1.samehadaku.how/wp-content/uploads/2026/02/image-8-1.jpg",
        episode: "1089",
    },
    {
        title: "Jujutsu Kaisen",
        image: "https://v1.samehadaku.how/wp-content/uploads/2026/02/Ikoku-Nikki-08.jpg",
        episode: "24",
    },
    {
        title: "Demon Slayer",
        image: "https://v1.samehadaku.how/wp-content/uploads/2026/02/image-8-1.jpg",
        episode: "55",
    },
    {
        title: "Attack on Titan",
        image: "https://v1.samehadaku.how/wp-content/uploads/2026/02/Ikoku-Nikki-08.jpg",
        episode: "87",
    },
    {
        title: "Spy x Family",
        image: "https://v1.samehadaku.how/wp-content/uploads/2026/02/image-8-1.jpg",
        episode: "37",
    },
];

export default function ContinueWatching() {
    return (
        <section className="px-3 pt-3">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">
                    Lanjutkan Menonton
                </h2>

                <a
                    href="/history"
                    className="text-sm hover:underline text-mykisah-primary"
                >
                    History
                </a>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {continueWatchingData.map((item, index) => (
                    <div key={index} className="flex-none w-52">
                        <div className="relative rounded-[8px] overflow-hidden bg-white/5">
                            {/* cover */}
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-28 object-cover"
                            />

                            {/* gradient biar teks kebaca */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/30 to-transparent" />

                            {/* episode + title di dalam gambar */}
                            <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-[11px] mb-0.5 text-mykisah-secondary">
                                    Ep {item.episode}
                                </p>

                                <h3 className="text-xs font-semibold leading-tight text-white">
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}