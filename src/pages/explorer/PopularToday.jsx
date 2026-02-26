import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PopularToday() {
    const [popularDonghua, setPopularDonghua] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalData, setTotalData] = useState(0);

    useEffect(() => {
        const fetchPopularToday = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://api-samehadaku-how-anichin.vercel.app/api/donghua/popular-today');

                if (!response.ok) {
                    throw new Error('Failed to fetch popular donghua today');
                }

                const result = await response.json();

                if (result.success && result.data) {
                    setPopularDonghua(result.data);
                    setTotalData(result.total || result.data.length);
                } else {
                    throw new Error('Invalid data format');
                }

            } catch (err) {
                setError(err.message);
                console.error('Error fetching popular donghua:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularToday();
    }, []);

    // Fungsi untuk mengekstrak slug dari URL anichin.moe
    const extractDonghuaSlug = (url) => {
        if (typeof url === 'string') {
            const matches = url.match(/https:\/\/anichin\.moe\/([^\/]+)/);
            return matches ? matches[1] : '';
        }
        return '';
    };

    // Format judul agar lebih rapi
    const formatTitle = (title) => {
        return title
            .replace(/ Subtitle Indonesia$/i, '')
            .replace(/ SUBTITLE INDONESIA$/i, '')
            .replace(/ Episode \d+.*$/i, '')
            .trim();
    };

    // Loading state
    if (loading) {
        return (
            <section className="px-3 pt-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-white">
                        Popular Today
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
                        Popular Today
                    </h2>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                    <p className="text-red-400 text-sm">Gagal memuat data Popular Today</p>
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
        <section className="px-2 pt-2">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-4 mt-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white">
                        Popular Today
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
                {popularDonghua.slice(0, 10).map((item, index) => {
                    const slug = extractDonghuaSlug(item.url);
                    const formattedTitle = formatTitle(item.title);

                    return (
                        <Link
                            key={index}
                            to={`/watch/donghua/${slug}`}
                            className="group block"
                        >
                            <div className="relative rounded-[8px] overflow-hidden hover:ring-2 hover:ring-mykisah-primary transition-all duration-200">
                                {/* Cover Image */}
                                <div className="relative aspect-[2/3]">
                                    <img
                                        src={item.image}
                                        alt={formattedTitle}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                                        }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-transparent to-transparent" />

                                    {/* Episode Badge - kiri bawah */}
                                    <div className="absolute bottom-2 left-1 z-10">
                                        <span className="bg-black/60 backdrop-blur-sm text-mykisah-primary text-[9px] px-1.5 py-0.5 rounded">
                                            {item.episode || 'Episode?'}
                                        </span>
                                    </div>
                                </div>

                                {/* Title di Bawah Image */}
                                <h3 className="text-xs font-semibold leading-tight text-white line-clamp-2 mb-2 px-0.5 group-hover:text-mykisah-primary transition-colors">
                                    {formattedTitle}
                                </h3>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Tampilkan pesan jika data kosong */}
            {popularDonghua.length === 0 && !loading && !error && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-sm">Tidak ada data popular today</p>
                </div>
            )}
        </section>
    );
}