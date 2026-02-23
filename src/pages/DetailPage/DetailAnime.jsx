// src/pages/DetailPage/DetailAnime.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DetailAnime() {
    const [detailData, setDetailData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('episode');
    const [lastWatchedEpisode, setLastWatchedEpisode] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Mendapatkan URL anime dari query parameter
    const queryParams = new URLSearchParams(location.search);
    const animeUrl = queryParams.get('url');

    const [expanded, setExpanded] = useState(false);

    const text = detailData?.synopsis?.[0] || detailData?.description || "";

    useEffect(() => {
        if (animeUrl) {
            fetchDetail();
            loadLastWatchedEpisode();
        }
    }, [animeUrl]);

    // Load last watched episode dari localStorage
    const loadLastWatchedEpisode = () => {
        const animeKey = `anime_progress_${animeUrl}`;
        const saved = localStorage.getItem(animeKey);
        if (saved) {
            setLastWatchedEpisode(JSON.parse(saved));
        }
    };

    // Simpan progres episode ke localStorage
    const saveEpisodeProgress = (episode) => {
        const animeKey = `anime_progress_${animeUrl}`;
        const progressData = {
            episodeNumber: episode.episode,
            episodeTitle: episode.title,
            episodeUrl: episode.url,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(animeKey, JSON.stringify(progressData));
        setLastWatchedEpisode(progressData);
    };

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const encodedUrl = encodeURIComponent(animeUrl);
            const response = await fetch(`https://apinimeee.vercel.app/api/anime/detail?url=${encodedUrl}`);
            const result = await response.json();

            if (result.success) {
                setDetailData(result.data);
            }
        } catch (error) {
            console.error('Error fetching detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handler untuk tombol Play
    const handlePlayClick = () => {
        if (!detailData?.episodes?.length) return;

        let targetEpisode;

        if (lastWatchedEpisode) {
            targetEpisode = detailData.episodes.find(
                ep => ep.episode === lastWatchedEpisode.episodeNumber
            );
        }

        if (!targetEpisode) {
            targetEpisode = detailData.episodes[0];
        }

        if (targetEpisode) {
            saveEpisodeProgress(targetEpisode);
            // Navigasi ke halaman streaming dengan URL episode
            navigate(`/streaming/anime?url=${encodeURIComponent(targetEpisode.url)}`);
        }
    };

    // Handler untuk klik episode
    const handleEpisodeClick = (e, episode) => {
        e.preventDefault();
        saveEpisodeProgress(episode);
        // Navigasi ke halaman streaming dengan URL episode
        navigate(`/streaming/anime?url=${encodeURIComponent(episode.url)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-[#ffaf2f]"></div>
            </div>
        );
    }

    if (!detailData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/60">
                Data tidak ditemukan
            </div>
        );
    }

    // Tentukan teks untuk tombol Play
    const getPlayButtonText = () => {
        if (!detailData?.episodes?.length) return "Play";

        if (lastWatchedEpisode) {
            return `Lanjut Eps. ${lastWatchedEpisode.episodeNumber}`;
        }
        return "Mulai Eps. 1";
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-8">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl px-4 py-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all"
                    >
                        <i className="ri-arrow-left-line text-xl" style={{ color: '#ffc05f' }}></i>
                    </button>

                    <div className="flex items-center">
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-white">Detail</span>
                            <span style={{ color: '#ffaf2f' }}> Anime</span>
                        </span>
                    </div>

                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all">
                        <i className="ri-share-line text-xl" style={{ color: '#ffc05f' }}></i>
                    </button>
                </div>
            </nav>

            <main className="px-4 space-y-4">
                {/* Hero Section dengan Cover Image */}
                <div className="relative -mx-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent h-48 bottom-0 top-auto"></div>
                    <img
                        src={detailData.image}
                        alt={detailData.title}
                        className="w-full h-64 object-cover"
                    />
                </div>

                {/* Title and Info */}
                <div className="space-y-3 -mt-16 relative z-10">
                    <h1 className="text-xl font-bold leading-tight line-clamp-2">{detailData.title}</h1>

                    {/* Genre Chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {detailData.genres?.map((genre, index) => (
                            <span
                                key={index}
                                className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10"
                                style={{ color: '#fed086' }}
                            >
                                {genre}
                            </span>
                        ))}
                    </div>

                    {/* Rating - Released - Studio */}
                    <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                            <i className="ri-star-fill text-sm" style={{ color: '#ffaf2f' }}></i>
                            {detailData.details?.rating || 'N/A'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-white/60">{detailData.details?.released?.split(' to ')[0] || '-'}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-white/60 line-clamp-1">{detailData.details?.studio || '-'}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handlePlayClick}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
                        style={{
                            backgroundColor: "#ffaf2f",
                            color: "#0a0a0a",
                        }}
                    >
                        <i className="ri-play-fill text-base"></i>
                        {getPlayButtonText()}
                    </button>

                    <button
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 border transition active:scale-95"
                        style={{
                            borderColor: "#ffaf2f40",
                            color: "#ffc05f",
                        }}
                    >
                        <i className="ri-download-2-line text-base"></i>
                        Download
                    </button>
                </div>

                {/* Sinopsis */}
                <div className="space-y-1">
                    <p
                        onClick={() => setExpanded(!expanded)}
                        className={`text-sm text-white/70 leading-relaxed text-justify cursor-pointer transition ${expanded ? "" : "line-clamp-3"
                            }`}
                    >
                        {text}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-white/10 mt-3 px-1">
                    {["episode", "informasi", "rekomendasi"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="py-3"
                        >
                            <div className="relative group">
                                <span
                                    className={`text-[15px] font-semibold transition ${activeTab === tab
                                        ? "text-[#ffaf2f]"
                                        : "text-white/80 group-hover:text-white"
                                        }`}
                                >
                                    {tab === "episode"
                                        ? "Episode"
                                        : tab === "informasi"
                                            ? "Informasi"
                                            : "Rekomendasi"}
                                </span>

                                <div
                                    className={`absolute -bottom-1 left-1/2 h-[2px] bg-[#ffaf2f] rounded-full transition-all duration-300
                                        ${activeTab === tab
                                            ? "w-full -translate-x-1/2 opacity-100"
                                            : "w-0 -translate-x-1/2 opacity-0"
                                        }`}
                                />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="pt-2">
                    {activeTab === "episode" && (
                        <div className="space-y-3">
                            {/* Tampilkan indikator progres jika ada */}
                            {lastWatchedEpisode && (
                                <div className="p-3 rounded-xl bg-[#ffaf2f10] border border-[#ffaf2f30]">
                                    <p className="text-xs text-white/60">
                                        <span className="text-[#ffaf2f]">Terakhir ditonton:</span> Episode {lastWatchedEpisode.episodeNumber} - {lastWatchedEpisode.episodeTitle}
                                    </p>
                                </div>
                            )}

                            {/* List Episode */}
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 hide-scrollbar">
                                {detailData.episodes?.map((episode, index) => {
                                    const isWatched = lastWatchedEpisode?.episodeNumber === episode.episode;

                                    return (
                                        <div
                                            key={index}
                                            onClick={(e) => handleEpisodeClick(e, episode)}
                                            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 active:scale-[0.98] cursor-pointer
                                                ${isWatched
                                                    ? 'border-[#ffaf2f40] bg-[#ffaf2f15]'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            {/* Episode number dengan indikator watched */}
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition
                                                ${isWatched
                                                    ? 'bg-[#ffaf2f] text-[#0a0a0a]'
                                                    : 'bg-[#ffaf2f15] text-[#ffaf2f] group-hover:bg-[#ffaf2f25]'
                                                }`}>
                                                {episode.episode}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-white leading-tight line-clamp-1">
                                                    {episode.title}
                                                    {isWatched && (
                                                        <span className="ml-2 text-[10px] text-[#ffaf2f]">• Ditonton</span>
                                                    )}
                                                </h3>

                                                <p className="text-[11px] text-white/50 mt-0.5">
                                                    {episode.date}
                                                </p>
                                            </div>

                                            {/* Play icon */}
                                            <i className="ri-play-circle-fill text-xl text-[#ffc05f] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tab Informasi */}
                    {activeTab === "informasi" && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(detailData.details || {}).map(([key, value]) => {
                                    if (!value || key === "synonyms") return null;

                                    const labels = {
                                        japanese: "Japanese",
                                        english: "English",
                                        status: "Status",
                                        type: "Type",
                                        source: "Source",
                                        duration: "Durasi",
                                        total_episode: "Episode",
                                        season: "Musim",
                                        studio: "Studio",
                                        rating: "Rating",
                                        producers: "Produser",
                                        released: "Rilis",
                                    };

                                    const text = String(value);

                                    // AUTO DETECT
                                    const isShort =
                                        text.length <= 18 &&
                                        !text.includes(",") &&
                                        text.split(" ").length <= 3;

                                    return (
                                        <div
                                            key={key}
                                            className={`rounded-xl border border-white/10 bg-white/5 p-3
                                                ${isShort ? "col-span-1" : "col-span-2"}`}
                                        >
                                            <span className="text-[10px] uppercase text-white/40 block mb-1">
                                                {labels[key] || key}
                                            </span>

                                            <span className="text-sm text-white/90 break-words">
                                                {value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tab Rekomendasi */}
                    {activeTab === 'rekomendasi' && (
                        <div className="space-y-3">
                            {detailData.recommendations?.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {detailData.recommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            onClick={() => navigate(`/streaming/anime?url=${encodeURIComponent(rec.url)}`)}
                                            className="space-y-1.5 cursor-pointer"
                                        >
                                            <div className="relative rounded-[7px] overflow-hidden bg-white/5 aspect-[2/3]">
                                                <img
                                                    src={rec.image}
                                                    alt={rec.title}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-1.5 right-1.5">
                                                    <span
                                                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                                                        style={{ backgroundColor: '#ffaf2f', color: '#0a0a0a' }}
                                                    >
                                                        <i className="ri-star-fill text-[8px]"></i>
                                                        {rec.rating}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="text-xs font-medium line-clamp-2 text-white/90">{rec.title}</h3>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-white/40 text-center py-8">
                                    Tidak ada rekomendasi
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}