import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Top10Anime() {
    const [topAnime, setTopAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchTop10Anime = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://api-samehadaku-how-anichin.vercel.app/api/anime/top-10');

                if (!response.ok) {
                    throw new Error('Failed to fetch top 10 anime');
                }

                const result = await response.json();

                if (result.success && result.data) {
                    setTopAnime(result.data);
                    setLastUpdated(result.updated_at);
                } else {
                    throw new Error('Invalid data format');
                }

            } catch (err) {
                setError(err.message);
                console.error('Error fetching top 10 anime:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTop10Anime();
    }, []);

    // Fungsi untuk mengekstrak slug dari URL
    const extractSlug = (url) => {
        const matches = url.match(/\/(?:anime|donghua)\/([^\/]+)/);
        return matches ? matches[1] : '';
    };

    // Loading state
    if (loading) {
        return (
            <section className="px-3 pt-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-white">
                        Top 10 Anime
                    </h2>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <div key={index} className="flex-none w-52 animate-pulse">
                            <div className="rounded-[8px] overflow-hidden bg-white/5">
                                <div className="w-full h-28 bg-gray-700" />
                                <div className="p-2">
                                    <div className="h-3 bg-gray-700 rounded w-16 mb-2" />
                                    <div className="h-4 bg-gray-700 rounded w-32" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="px-3 pt-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-white">
                        Top 10 Anime
                    </h2>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                    <p className="text-red-400 text-sm">Gagal memuat data Top 10 Anime</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs text-mykisah-primary hover:underline"
                    >
                        Coba lagi
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="px-3 pt-3">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-base font-semibold text-white">
                        Top 10 Anime
                    </h2>
                </div>

                <Link
                    to="/explore/detail/top-10-anime"
                    className="text-sm hover:underline text-mykisah-primary"
                >
                    Detail
                </Link>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-10 hide-scrollbar">
                {topAnime.map((item, index) => {
                    const slug = extractSlug(item.url);

                    return (
                        <Link
                            key={item.rank || index}
                            to={`/detail/anime/${slug}`}
                            className="flex-none w-[150px]"
                        >
                            <div className="relative rounded-[8px] overflow-hidden bg-white/5 hover:ring-2 hover:ring-mykisah-primary/50 transition-all duration-200">
                                {/* Rank Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                    <div className="bg-mykisah-primary text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                        {item.rank}
                                    </div>
                                </div>

                                {/* Cover Image */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-[190px] object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x150?text=No+Image';
                                    }}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-transparent" />

                                {/* Rating Badge */}
                                {item.rating && (
                                    <div className="absolute top-2 right-2 z-10">
                                        <div className="bg-black/60 backdrop-blur-sm text-mykisah-primary text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-mykisah-primary/30">
                                            <span>⭐</span>
                                            {item.rating}
                                        </div>
                                    </div>
                                )}

                                {/* Episode + Title */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-[10px] mb-0.5 opacity-90 text-mykisah-primary">
                                        Rank #{item.rank}
                                    </p>

                                    <h3 className="text-xs font-semibold leading-tight text-white line-clamp-2">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* CSS untuk hide scrollbar */}
            <style jsx>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}