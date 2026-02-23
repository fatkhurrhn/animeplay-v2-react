import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function WatchPage() {
    const { type, episodeSlug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedServer, setSelectedServer] = useState(0);
    const [serverStatus, setServerStatus] = useState({});
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [playerError, setPlayerError] = useState(false);
    const [availableQualities, setAvailableQualities] = useState([]);
    const [selectedQuality, setSelectedQuality] = useState('auto');
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const playerRef = useRef(null);
    const [isPlayerSticky, setIsPlayerSticky] = useState(false);
    const playerContainerRef = useRef(null);

    const contentType = type || location.state?.type || 'anime';

    useEffect(() => {
        fetchWatchData();
    }, [episodeSlug, contentType]);

    useEffect(() => {
        setServerStatus({});
        setSelectedServer(0);
        setPlayerError(false);
        setAvailableQualities([]);
        setSelectedQuality('auto');
    }, [data?.episode?.url]);

    useEffect(() => {
        const handleScroll = () => {
            if (playerContainerRef.current) {
                const rect = playerContainerRef.current.getBoundingClientRect();
                setIsPlayerSticky(rect.top <= 0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchWatchData = async () => {
        setLoading(true);
        try {
            const cleanSlug = episodeSlug.replace(/\/$/, '');
            const baseUrl = `https://apinimeee.vercel.app/api/${contentType}/watch/${cleanSlug}`;
            const response = await fetch(baseUrl);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                const initialStatus = {};
                result.data.streams.forEach((_, index) => {
                    initialStatus[index] = 'pending';
                });
                setServerStatus(initialStatus);

                // Detect available qualities from streams
                detectQualities(result.data.streams);
            } else {
                setError('Failed to fetch streaming data');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to detect qualities from stream info
    const detectQualities = (streams) => {
        const qualities = new Set();
        qualities.add('auto');

        streams.forEach(stream => {
            // Check if stream URL contains quality indicators
            if (stream.url?.includes('1080') || stream.server?.toLowerCase().includes('1080')) {
                qualities.add('1080p');
            }
            if (stream.url?.includes('720') || stream.server?.toLowerCase().includes('720')) {
                qualities.add('720p');
            }
            if (stream.url?.includes('480') || stream.server?.toLowerCase().includes('480')) {
                qualities.add('480p');
            }
            if (stream.url?.includes('360') || stream.server?.toLowerCase().includes('360')) {
                qualities.add('360p');
            }

            // Check server names for quality hints
            const serverLower = stream.server?.toLowerCase() || '';
            if (serverLower.includes('ok.ru')) {
                qualities.add('1080p');
                qualities.add('720p');
                qualities.add('480p');
                qualities.add('360p');
            }
            if (serverLower.includes('dailymotion')) {
                qualities.add('1080p');
                qualities.add('720p');
                qualities.add('480p');
            }
            if (serverLower.includes('rumble')) {
                qualities.add('1080p');
                qualities.add('720p');
                qualities.add('480p');
            }
        });

        setAvailableQualities(Array.from(qualities));
    };

    const handleIframeError = () => {
        const currentServer = selectedServer;
        const streams = getStreams();

        setServerStatus(prev => ({ ...prev, [currentServer]: 'error' }));
        setPlayerError(true);

        const nextServer = streams.findIndex((_, index) =>
            index > currentServer && serverStatus[index] !== 'error'
        );

        if (nextServer !== -1) {
            console.log(`Server ${currentServer} failed, trying server ${nextServer}`);
            setSelectedServer(nextServer);
            setPlayerError(false);
        } else {
            const firstAvailable = streams.findIndex((_, index) =>
                serverStatus[index] !== 'error'
            );
            if (firstAvailable !== -1) {
                setSelectedServer(firstAvailable);
                setPlayerError(false);
            }
        }
    };

    // Function to modify iframe src based on quality
    const getStreamUrlWithQuality = (stream) => {
        let baseUrl = stream.url;

        if (stream.original_iframe) {
            const srcMatch = stream.original_iframe.match(/src="([^"]+)"/);
            baseUrl = srcMatch ? srcMatch[1] : stream.url;
        }

        // Add quality parameter based on server type
        if (selectedQuality !== 'auto') {
            const qualityValue = selectedQuality.replace('p', '');

            if (baseUrl.includes('ok.ru')) {
                // OK.ru quality format
                return baseUrl.includes('?')
                    ? `${baseUrl}&quality=${qualityValue}`
                    : `${baseUrl}?quality=${qualityValue}`;
            }

            if (baseUrl.includes('dailymotion.com')) {
                // Dailymotion quality format
                return baseUrl.includes('?')
                    ? `${baseUrl}&quality=${qualityValue}`
                    : `${baseUrl}?quality=${qualityValue}`;
            }

            if (baseUrl.includes('rumble.com')) {
                // Rumble quality format
                return baseUrl.includes('?')
                    ? `${baseUrl}&quality=${qualityValue}`
                    : `${baseUrl}?quality=${qualityValue}`;
            }
        }

        return baseUrl;
    };

    const renderIframe = (stream) => {
        const src = getStreamUrlWithQuality(stream);

        return (
            <iframe
                ref={playerRef}
                src={src}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                onError={handleIframeError}
                onLoad={() => {
                    setServerStatus(prev => ({ ...prev, [selectedServer]: 'success' }));
                    setPlayerError(false);
                }}
            ></iframe>
        );
    };

    // Helper functions
    const getEpisodeTitle = () => data?.episode?.title || 'Episode';
    const getSeriesTitle = () => data?.episode?.series_title || data?.series_details?.title || 'Series';
    const getEpisodeNumber = () => data?.episode?.number || '';
    const getStreams = () => data?.streams || [];
    const getNavigation = () => data?.navigation || {};
    const getEpisodeList = () => data?.episode_list || data?.related_episodes || [];
    const getDownloads = () => {
        if (data?.downloads) return data.downloads;
        if (data?.download_url) return [{ url: data.download_url, title: 'Download' }];
        return [];
    };
    const getRecommendations = () => data?.recommendations || [];

    const handleEpisodeChange = (url) => {
        if (!url) return;
        const slug = url.split('/').filter(Boolean).pop();
        navigate(`/watch/${contentType}/${slug}`, {
            state: { type: contentType }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#333] border-t-[#f5b048] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#fbc266]">Loading video...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <i className="ri-error-warning-line text-5xl text-[#fbc266] mb-4"></i>
                    <p className="text-gray-400 mb-4">Error: {error || 'Failed to load video'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-[#f5b048] text-[#1a1a1a] rounded-lg font-semibold hover:bg-[#e39923] transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const streams = getStreams();
    const navigation = getNavigation();
    const episodeList = getEpisodeList();
    const downloads = getDownloads();
    const recommendations = getRecommendations();
    const hasDownloads = data?.has_downloads || data?.download_url;

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white pb-8">
            {/* Simple Header */}
            <div className="bg-[#1a1a1a] p-4 border-b border-[#333]">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[#fbc266] hover:text-[#f5b048] transition-colors"
                    >
                        <i className="ri-arrow-left-line text-2xl"></i>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-medium text-[#fee0ae] truncate">
                            {getSeriesTitle()}
                        </h1>
                        <p className="text-xs text-gray-400">
                            Episode {getEpisodeNumber()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Video Player Container */}
            <div
                ref={playerContainerRef}
                className={`bg-black transition-all duration-300 ${isPlayerSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''
                    }`}
            >
                {/* Aspect ratio container for video */}
                <div className="relative pt-[56.25%] bg-black">
                    {streams.length > 0 ? (
                        renderIframe(streams[selectedServer])
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a]">
                            <p className="text-gray-400">No streams available</p>
                        </div>
                    )}

                    {/* Error overlay for auto-switch feedback */}
                    {playerError && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                            <div className="text-center">
                                <i className="ri-refresh-line text-4xl text-[#fbc266] animate-spin mb-2"></i>
                                <p className="text-sm text-[#fbc266]">Switching to next server...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Server Selection & Quality Control */}
                <div className="bg-[#2a2a2a] p-3 border-t border-[#333]">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#444]">
                        {/* Server buttons */}
                        {streams.map((stream, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setSelectedServer(index);
                                    setPlayerError(false);
                                }}
                                disabled={serverStatus[index] === 'error'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${selectedServer === index
                                        ? 'bg-[#f5b048] text-[#1a1a1a]'
                                        : serverStatus[index] === 'error'
                                            ? 'bg-[#331111] text-gray-500 line-through'
                                            : 'bg-[#333] text-gray-400 hover:bg-[#444]'
                                    }`}
                            >
                                <i className="ri-server-line"></i>
                                {stream.server}
                                {stream.type === 'main' && (
                                    <span className="ml-1 text-[10px] bg-[#e39923] px-1 rounded">main</span>
                                )}
                                {serverStatus[index] === 'success' && selectedServer !== index && (
                                    <i className="ri-check-line text-green-500"></i>
                                )}
                            </button>
                        ))}

                        {/* Quality selector button */}
                        {availableQualities.length > 1 && (
                            <div className="relative ml-auto">
                                <button
                                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#333] text-[#fbc266] hover:bg-[#444] transition-all flex items-center gap-1"
                                >
                                    <i className="ri-hd-line"></i>
                                    {selectedQuality === 'auto' ? 'Auto' : selectedQuality}
                                    <i className={`ri-arrow-down-s-line transition-transform ${showQualityMenu ? 'rotate-180' : ''}`}></i>
                                </button>

                                {/* Quality dropdown menu */}
                                {showQualityMenu && (
                                    <div className="absolute bottom-full mb-2 right-0 bg-[#2a2a2a] rounded-lg shadow-lg border border-[#444] overflow-hidden z-50">
                                        {availableQualities.map(quality => (
                                            <button
                                                key={quality}
                                                onClick={() => {
                                                    setSelectedQuality(quality);
                                                    setShowQualityMenu(false);
                                                    // Refresh iframe with new quality
                                                    const currentStream = streams[selectedServer];
                                                    if (currentStream) {
                                                        setPlayerError(true);
                                                        setTimeout(() => {
                                                            setPlayerError(false);
                                                        }, 500);
                                                    }
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-xs hover:bg-[#333] transition-colors ${selectedQuality === quality
                                                        ? 'bg-[#f5b048]/20 text-[#f5b048]'
                                                        : 'text-gray-300'
                                                    }`}
                                            >
                                                {quality === 'auto' ? 'Auto' : quality}
                                                {quality === 'auto' && <span className="ml-2 text-[10px] text-gray-400">Recommended</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Spacer for sticky player */}
            {isPlayerSticky && <div className="pt-[calc(56.25%+85px)]"></div>}

            {/* Episode Info & Actions */}
            <div className="p-4 border-b border-[#333]">
                <h2 className="text-base font-semibold text-[#fee0ae] mb-1">
                    {getEpisodeTitle()}
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                    {data?.episode?.release_date || ''}
                </p>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEpisodeChange(navigation.prev?.url)}
                        disabled={!navigation.prev?.url}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${navigation.prev?.url
                                ? 'bg-[#2a2a2a] text-[#fbc266] hover:bg-[#333] border border-[#444]'
                                : 'bg-[#222] text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        <i className="ri-arrow-left-s-line"></i>
                        Prev
                    </button>

                    <button
                        onClick={() => handleEpisodeChange(navigation.next?.url)}
                        disabled={!navigation.next?.url}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${navigation.next?.url
                                ? 'bg-[#2a2a2a] text-[#fbc266] hover:bg-[#333] border border-[#444]'
                                : 'bg-[#222] text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        Next
                        <i className="ri-arrow-right-s-line"></i>
                    </button>

                    {hasDownloads && (
                        <button
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            className="px-4 py-2.5 bg-[#f5b048] text-[#1a1a1a] rounded-lg font-medium hover:bg-[#e39923] transition-colors"
                        >
                            <i className="ri-download-2-line text-lg"></i>
                        </button>
                    )}
                </div>

                {/* Download Menu */}
                {showDownloadMenu && downloads.length > 0 && (
                    <div className="mt-3 bg-[#2a2a2a] rounded-xl p-3 border border-[#444]">
                        <p className="text-xs text-[#fee0ae] mb-2">Download Links:</p>
                        {data?.downloads ? (
                            downloads.map((download, idx) => (
                                <div key={idx} className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">{download.title || 'Download'}</p>
                                    {download.items?.map((item, iidx) => (
                                        <div key={iidx} className="mb-2">
                                            <p className="text-xs text-[#fbc266] mb-1">{item.quality}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {item.links?.map((link, lidx) => (
                                                    <a
                                                        key={lidx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-[#333] text-white px-3 py-1.5 rounded-lg hover:bg-[#444] transition-colors"
                                                    >
                                                        {link.provider}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <a
                                href={data?.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center py-2 bg-[#f5b048] text-[#1a1a1a] rounded-lg text-sm font-semibold hover:bg-[#e39923] transition-colors"
                            >
                                <i className="ri-download-line mr-1"></i>
                                Download Episode
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Series Info & Genres */}
            {data?.series_details && (
                <div className="p-4 border-b border-[#333]">
                    <div className="flex items-start gap-3 mb-3">
                        <img
                            src={data.series_details.thumbnail}
                            alt={getSeriesTitle()}
                            className="w-16 h-22 rounded-lg object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64x88?text=No+Image';
                            }}
                        />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[#fee0ae] mb-1">{getSeriesTitle()}</h3>
                            <p className="text-xs text-gray-300 line-clamp-3">
                                {data.series_details.synopsis || 'No synopsis available.'}
                            </p>
                            <button
                                onClick={() => {
                                    const seriesSlug = data.episode?.series_url?.split('/').filter(Boolean).pop();
                                    if (seriesSlug) {
                                        navigate(`/detail/${contentType}/${seriesSlug}`);
                                    }
                                }}
                                className="mt-1 text-xs text-[#fbc266] hover:text-[#f5b048]"
                            >
                                Read More <i className="ri-arrow-right-s-line"></i>
                            </button>
                        </div>
                    </div>

                    {/* Genres */}
                    {data.series_details.genres && (
                        <div className="flex flex-wrap gap-2">
                            {data.series_details.genres.map((genre, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-3 py-1 bg-[#2a2a2a] text-[#fbc266] rounded-full border border-[#444]"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Horizontal Episode List */}
            {episodeList.length > 0 && (
                <div className="p-4 border-b border-[#333]">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[#fee0ae]">Episodes</h3>
                        <span className="text-xs text-gray-400">Total {episodeList.length}</span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#444]">
                        {episodeList.map((ep, index) => {
                            const isCurrent = ep.url === data?.episode?.url;
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        handleEpisodeChange(ep.url);
                                    }}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center transition-all ${isCurrent
                                            ? 'bg-[#f5b048] text-[#1a1a1a]'
                                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333] border border-[#444]'
                                        }`}
                                >
                                    <span className="text-xs font-bold">
                                        {ep.number || ep.episode || index + 1}
                                    </span>
                                    {ep.full_number?.includes('END') && (
                                        <span className="text-[8px] mt-0.5">END</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#fee0ae] mb-3">You Might Also Like</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {recommendations.slice(0, 4).map((rec, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    const recUrl = rec.url?.detail || rec.url;
                                    const recSlug = recUrl?.split('/').filter(Boolean).pop();
                                    const recType = rec.type?.toLowerCase() === 'donghua' ? 'donghua' : 'anime';
                                    if (recSlug) {
                                        navigate(`/detail/${recType}/${recSlug}`);
                                    }
                                }}
                                className="bg-[#2a2a2a] rounded-xl overflow-hidden cursor-pointer hover:scale-[0.98] transition-transform border border-[#333] hover:border-[#f5b048]"
                            >
                                <div className="relative pt-[140%]">
                                    <img
                                        src={rec.image}
                                        alt={rec.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/247x350?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a1a1a] to-transparent p-2">
                                        <p className="text-xs text-[#fee0ae] line-clamp-2">{rec.title}</p>
                                        <span className="text-[10px] text-gray-400">{rec.type || 'Anime'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scroll to top button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 bg-[#f5b048] text-[#1a1a1a] w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-[#e39923] transition-colors duration-300 z-50"
            >
                <i className="ri-arrow-up-line text-xl"></i>
            </button>
        </div>
    );
}