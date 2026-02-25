import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function DetailTop10() {
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
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="rounded-[8px] overflow-hidden bg-white/5">
                                <div className="w-full aspect-[2/3] bg-gray-700" />
                                <div className="p-2">
                                    <div className="h-3 bg-gray-700 rounded w-16 mb-2" />
                                    <div className="h-4 bg-gray-700 rounded w-full" />
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
            {/* Sticky Header */}
            <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl px-2 py-2 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <i className="ri-vip-crown-line text-2xl text-mykisah-primary"></i>
                    </div>

                    <div className="flex items-center">
                        <span className="text-[23px] font-semibold tracking-tight">
                            <span className="text-white">Top 10</span>
                            <span className="text-mykisah-primary"> Anime</span>
                        </span>
                    </div>

                    <Link to="/search" className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all">
                        <i className="ri-search-line text-xl text-mykisah-primary"></i>
                    </Link>
                </div>
            </nav>

            {/* Header Section */}
            <div className="flex items-center justify-between mb-4 mt-2">
                <div className="flex items-center gap-2">
                    {/* <div className="w-1 h-5 bg-mykisah-primary rounded-full"></div> */}
                    <h2 className="text-base font-semibold text-white">
                        Top 10 Minggu Ini
                    </h2>
                </div>

                <Link
                    to="#"
                    className="text-sm hover:underline text-mykisah-primary flex items-center gap-1"
                >
                    Semua
                </Link>
            </div>

            {/* Grid 3 Kolom */}
            <div className="grid grid-cols-3 gap-2 pb-[25px]">
                {topAnime.slice(0, 10).map((item, index) => {
                    const slug = extractSlug(item.url);

                    return (
                        <Link
                            key={item.rank || index}
                            to={`/detail/anime/${slug}`}
                            className="group block"
                        >
                            <div className="relative rounded-[8px] overflow-hidden hover:ring-2 hover:ring-mykisah-primary transition-all duration-200">
                                {/* Rank Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                    <div className={`
                        text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg
                        ${item.rank === 1 ? 'bg-yellow-400 text-black' :
                                            item.rank === 2 ? 'bg-gray-300 text-black' :
                                                item.rank === 3 ? 'bg-amber-600 text-white' :
                                                    'bg-black/60 backdrop-blur-sm text-white border border-white/20'}
                    `}>
                                        {item.rank}
                                    </div>
                                </div>

                                {/* Cover Image */}
                                <div className="relative aspect-[2/3]">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                                        }}
                                    />

                                    {/* Gradient Overlay - lebih transparan */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-transparent to-transparent" />

                                    {/* Rating Badge - kanan atas */}
                                    {item.rating && (
                                        <div className="absolute top-2 right-2 z-10">
                                            <div className="bg-black/60 backdrop-blur-sm text-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-yellow-400/30">
                                                <i className="ri-star-fill text-[8px]"></i>
                                                {item.rating}
                                            </div>
                                        </div>
                                    )}

                                    {/* Type Info - kiri bawah (tetap di dalam image) */}
                                    <div className="absolute bottom-2 left-1 z-10">
                                        <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded">
                                            {item.type || 'Anime'} • #{item.rank}
                                        </span>
                                    </div>
                                </div>

                                {/* Title di Bawah Image - tanpa background */}
                                <h3 className="text-xs font-semibold leading-tight text-white line-clamp-2 mb-2 px-0.5 group-hover:text-mykisah-primary transition-colors">
                                    {item.title}
                                </h3>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Last Updated Info */}
            {lastUpdated && (
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-gray-500">
                        Last updated: {new Date(lastUpdated).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            )}
        </section>
    );
}