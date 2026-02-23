// src/pages/streaming/AnimeSteaming.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AnimeStreaming() {
    const [streamData, setStreamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stream');
    const [selectedQuality, setSelectedQuality] = useState(null);
    const [showAllEpisodes, setShowAllEpisodes] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Mendapatkan URL episode dari query parameter
    const queryParams = new URLSearchParams(location.search);
    const episodeUrl = queryParams.get('url');

    useEffect(() => {
        if (episodeUrl) {
            fetchStreamData();
        }
    }, [episodeUrl]);

    const fetchStreamData = async () => {
        setLoading(true);
        try {
            const encodedUrl = encodeURIComponent(episodeUrl);
            const response = await fetch(`https://apinimeee.vercel.app/api/anime/watch?url=${encodedUrl}`);
            const result = await response.json();

            if (result.success) {
                setStreamData(result.data);
                // Set default quality ke yang pertama
                if (result.data.streams?.length > 0) {
                    setSelectedQuality(result.data.streams[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching stream data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk mengecek tipe link (embed atau direct video)
    const isEmbedUrl = (url) => {
        return url.includes('blogger.com') ||
            url.includes('mega.nz/embed') ||
            url.includes('filedon.co/embed') ||
            url.includes('wibufile.com/embed');
    };

    // Fungsi untuk mendapatkan URL embed yang benar
    const getEmbedUrl = (url) => {
        if (url.includes('mega.nz/embed')) return url;
        if (url.includes('mega.nz/file')) {
            return url.replace('mega.nz/file', 'mega.nz/embed');
        }
        return url;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-[#ffaf2f]"></div>
            </div>
        );
    }

    if (!streamData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/60">
                Data tidak ditemukan
            </div>
        );
    }

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
                            <span className="text-white">Streaming</span>
                            <span style={{ color: '#ffaf2f' }}> Anime</span>
                        </span>
                    </div>

                    <button className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all">
                        <i className="ri-share-line text-xl" style={{ color: '#ffc05f' }}></i>
                    </button>
                </div>
            </nav>

            <main className="px-4 space-y-4">
                {/* Video Player Section */}
                <div className="relative -mx-4">
                    {selectedQuality ? (
                        isEmbedUrl(selectedQuality.url) ? (
                            <iframe
                                src={getEmbedUrl(selectedQuality.url)}
                                className="w-full aspect-video bg-black"
                                allowFullScreen
                                allow="autoplay; fullscreen"
                                frameBorder="0"
                            />
                        ) : (
                            <video
                                src={selectedQuality.url}
                                className="w-full aspect-video bg-black"
                                controls
                                autoPlay
                                playsInline
                            >
                                <source src={selectedQuality.url} type="video/mp4" />
                                Browser Anda tidak mendukung video tag.
                            </video>
                        )
                    ) : (
                        <div className="w-full aspect-video bg-black/50 flex items-center justify-center">
                            <p className="text-white/40">Pilih server streaming</p>
                        </div>
                    )}
                </div>

                {/* Episode Info */}
                <div className="space-y-2">
                    <h1 className="text-lg font-bold leading-tight">{streamData.episode?.title}</h1>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-[#ffaf2f20] text-[#ffaf2f] text-[10px] font-medium">
                            Episode {streamData.episode?.episode_number}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-white/60">{streamData.episode?.release_date}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="text-white/60">Author: {streamData.episode?.author}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/70 leading-relaxed line-clamp-2">
                        {streamData.episode?.description}
                    </p>
                </div>

                {/* Navigation Buttons (Prev/Next/All) */}
                <div className="flex gap-2">
                    {streamData.navigation?.prev?.url && (
                        <button
                            onClick={() => navigate(`/streaming/anime?url=${encodeURIComponent(streamData.navigation.prev.url)}`)}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 transition active:scale-95"
                        >
                            <i className="ri-skip-back-fill text-base"></i>
                            Prev
                        </button>
                    )}

                    {streamData.navigation?.next?.url && (
                        <button
                            onClick={() => navigate(`/streaming/anime?url=${encodeURIComponent(streamData.navigation.next.url)}`)}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 transition active:scale-95"
                        >
                            Next
                            <i className="ri-skip-forward-fill text-base"></i>
                        </button>
                    )}

                    {streamData.navigation?.all_episodes?.url && (
                        <button
                            onClick={() => window.open(streamData.navigation.all_episodes.url, '_blank')}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                            style={{
                                backgroundColor: "#ffaf2f",
                                color: "#0a0a0a",
                            }}
                        >
                            <i className="ri-list-unordered"></i>
                            All Eps
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-white/10 mt-2">
                    {["stream", "download", "episode", "info"].map((tab) => (
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
                                    {tab === "stream" ? "Stream" :
                                        tab === "download" ? "Download" :
                                            tab === "episode" ? "Episode Lain" : "Info"}
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
                    {/* Tab Stream */}
                    {activeTab === "stream" && (
                        <div className="space-y-3">
                            <p className="text-xs text-white/40 mb-2">Pilih Server Streaming ({streamData.total_streams})</p>
                            <div className="grid grid-cols-2 gap-2">
                                {streamData.streams?.map((stream, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedQuality(stream)}
                                        className={`p-3 rounded-xl border transition-all active:scale-95 text-left
                                            ${selectedQuality?.url === stream.url
                                                ? 'border-[#ffaf2f] bg-[#ffaf2f15]'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className={`text-sm font-medium block ${selectedQuality?.url === stream.url ? 'text-[#ffaf2f]' : 'text-white'}`}>
                                            {stream.server}
                                        </span>
                                        <span className="text-[10px] text-white/40 mt-1 block">
                                            Click to play
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab Download */}
                    {activeTab === "download" && streamData.has_downloads && (
                        <div className="space-y-4">
                            {Object.entries(streamData.downloads || {}).map(([format, qualities]) => (
                                <div key={format} className="space-y-2">
                                    <h3 className="text-sm font-semibold text-white/80 uppercase">{format}</h3>
                                    <div className="space-y-3">
                                        {qualities.map((quality, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <p className="text-xs text-[#ffaf2f] font-medium">{quality.quality}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {quality.links.map((link, linkIdx) => (
                                                        <a
                                                            key={linkIdx}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
                                                        >
                                                            {link.provider}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab Episode Lain */}
                    {activeTab === "episode" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-white/40">
                                    {streamData.total_other_episodes} Episode lainnya
                                </p>
                                <button
                                    onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                                    className="text-xs text-[#ffaf2f]"
                                >
                                    {showAllEpisodes ? 'Show Less' : 'Show All'}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {(showAllEpisodes
                                    ? streamData.other_episodes
                                    : streamData.other_episodes?.slice(0, 3)
                                )?.map((episode, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigate(`/streaming/anime?url=${encodeURIComponent(episode.url)}`)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-[0.98]"
                                    >
                                        <img
                                            src={episode.thumbnail}
                                            alt={episode.title}
                                            className="w-12 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0 text-left">
                                            <h4 className="text-sm font-medium line-clamp-2">{episode.title}</h4>
                                            <p className="text-[10px] text-white/40 mt-1">{episode.date}</p>
                                        </div>
                                        <i className="ri-play-circle-fill text-xl text-[#ffc05f] opacity-80"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab Info */}
                    {activeTab === "info" && streamData.series && (
                        <div className="space-y-4">
                            {/* Series Info */}
                            <div className="flex gap-3">
                                <img
                                    src={streamData.series.thumbnail}
                                    alt={streamData.series.title}
                                    className="w-20 h-28 object-cover rounded-lg"
                                />
                                <div className="flex-1 space-y-2">
                                    <h3 className="font-bold">{streamData.series.title}</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {streamData.series.genres?.map((genre, idx) => (
                                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Synopsis */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-white/80">Sinopsis</h4>
                                <p className="text-sm text-white/70 leading-relaxed">
                                    {streamData.series.synopsis}
                                </p>
                            </div>

                            {/* Breadcrumb */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-white/80">Navigation</h4>
                                <div className="flex flex-wrap items-center gap-1 text-xs">
                                    {streamData.breadcrumb?.map((item, idx) => (
                                        <React.Fragment key={idx}>
                                            {idx > 0 && <span className="text-white/20">/</span>}
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white/60 hover:text-[#ffaf2f] transition"
                                            >
                                                {item.name}
                                            </a>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {streamData.recommendations?.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-white/80">Rekomendasi</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {streamData.recommendations.slice(0, 3).map((rec, idx) => (
                                            <a
                                                key={idx}
                                                href={`/detail-anime?url=${encodeURIComponent(rec.url)}`}
                                                className="space-y-1"
                                            >
                                                <div className="relative rounded-lg overflow-hidden aspect-[2/3]">
                                                    <img
                                                        src={rec.image}
                                                        alt={rec.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <h5 className="text-[10px] font-medium line-clamp-2">{rec.title}</h5>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}