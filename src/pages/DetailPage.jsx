import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function DetailPage() {
    const { type, slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('episodes'); // 'episodes' or 'characters'

    // Determine if it's anime or donghua from URL or state
    const contentType = type || location.state?.type || 'anime';
    const titleFromState = location.state?.title;

    useEffect(() => {
        fetchDetail();
    }, [slug, contentType]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const baseUrl = `https://apinimeee.vercel.app/api/${contentType}/detail/${slug}`;
            const response = await fetch(baseUrl);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError('Failed to fetch detail');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions to handle different data structures
    const getTitle = () => data?.title || titleFromState || 'Unknown Title';

    const getImage = () => data?.image || '';

    const getSynopsis = () => data?.synopsis || data?.description || 'No synopsis available.';

    const getStatus = () => {
        if (contentType === 'anime') {
            return data?.info?.status || 'Unknown';
        } else {
            return data?.info?.status || 'Unknown';
        }
    };

    const getType = () => {
        if (contentType === 'anime') {
            return data?.info?.type || 'Anime';
        } else {
            return data?.info?.type || 'Donghua';
        }
    };

    const getGenres = () => {
        return data?.genres || [];
    };

    const getEpisodes = () => {
        return data?.episodes || [];
    };

    const getCharacters = () => {
        return data?.characters || [];
    };

    const getInfoItems = () => {
        if (contentType === 'anime') {
            const info = data?.info || {};
            return [
                { label: 'Studio', value: info.studio?.[0]?.name },
                { label: 'Released', value: info.released },
                { label: 'Season', value: info.season?.[0]?.name },
                { label: 'Total Episodes', value: info.total_episodes },
                { label: 'Duration', value: info.duration },
                { label: 'Censor', value: info.censor },
                { label: 'Director', value: info.director?.[0]?.name },
                { label: 'Updated On', value: info.updated_on },
            ].filter(item => item.value);
        } else {
            const info = data?.info || {};
            return [
                { label: 'Studio', value: info.studio },
                { label: 'Network', value: info.network },
                { label: 'Released', value: info.released },
                { label: 'Season', value: info.season },
                { label: 'Country', value: info.country },
                { label: 'Total Episodes', value: info.total_episodes },
                { label: 'Duration', value: info.duration },
                { label: 'Fansub', value: info.fansub },
                { label: 'Updated On', value: info.updated_on },
            ].filter(item => item.value);
        }
    };

    const getRating = () => {
        if (contentType === 'donghua' && data?.rating) {
            return data.rating;
        }
        return null;
    };

    const getTrailerUrl = () => {
        return data?.trailer_url || null;
    };

    const getRecommendations = () => {
        return data?.recommendations || [];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#333] border-t-[#f5b048] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#fbc266]">Loading detail...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <i className="ri-error-warning-line text-5xl text-[#fbc266] mb-4"></i>
                    <p className="text-gray-400 mb-4">Error: {error || 'Data not found'}</p>
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

    const episodes = getEpisodes();
    const characters = getCharacters();
    const recommendations = getRecommendations();
    const rating = getRating();
    const trailerUrl = getTrailerUrl();

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white pb-8">
            {/* Back Button & Header */}
            <div className="sticky top-0 z-10 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-[#333] p-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[#fbc266] hover:text-[#f5b048] transition-colors"
                    >
                        <i className="ri-arrow-left-line text-2xl"></i>
                    </button>
                    <h1 className="text-lg font-semibold text-[#fee0ae] truncate flex-1">
                        {getTitle()}
                    </h1>
                    {trailerUrl && (
                        <a
                            href={trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#fbc266] hover:text-[#f5b048] transition-colors"
                        >
                            <i className="ri-film-line text-xl"></i>
                        </a>
                    )}
                </div>
            </div>

            {/* Hero Section with Image and Basic Info */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent h-32 bottom-0"></div>
                <img
                    src={getImage()}
                    alt={getTitle()}
                    className="w-full h-64 object-cover opacity-50"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                    }}
                />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h1 className="text-2xl font-bold text-[#fee0ae] mb-2">{getTitle()}</h1>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-[#f5b048] text-[#1a1a1a] rounded-full text-xs font-bold">
                            {getType()}
                        </span>
                        <span className="px-3 py-1 bg-[#e39923] text-[#1a1a1a] rounded-full text-xs font-bold">
                            {getStatus()}
                        </span>
                        {rating && (
                            <span className="px-3 py-1 bg-[#fbc266] text-[#1a1a1a] rounded-full text-xs font-bold flex items-center gap-1">
                                <i className="ri-star-fill"></i>
                                {rating.value}/10 ({rating.votes} votes)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="p-4 space-y-6">
                {/* Genres */}
                {getGenres().length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-[#fee0ae] mb-2">Genres</h2>
                        <div className="flex flex-wrap gap-2">
                            {getGenres().map((genre, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-[#2a2a2a] text-[#fbc266] rounded-full text-xs border border-[#f5b048]/30"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Synopsis */}
                <div>
                    <h2 className="text-sm font-semibold text-[#fee0ae] mb-2">Synopsis</h2>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {getSynopsis()}
                    </p>
                </div>

                {/* Info Grid */}
                <div>
                    <h2 className="text-sm font-semibold text-[#fee0ae] mb-2">Information</h2>
                    <div className="grid grid-cols-2 gap-3 bg-[#2a2a2a] rounded-xl p-4">
                        {getInfoItems().map((item, index) => (
                            <div key={index} className="text-sm">
                                <span className="text-gray-400 block text-xs">{item.label}</span>
                                <span className="text-white font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs for Episodes and Characters */}
                {(episodes.length > 0 || characters.length > 0) && (
                    <div>
                        <div className="flex gap-2 bg-[#2a2a2a] p-1 rounded-xl mb-4">
                            {episodes.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('episodes')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'episodes'
                                            ? 'bg-[#f5b048] text-[#1a1a1a]'
                                            : 'text-gray-400 hover:text-[#fbc266]'
                                        }`}
                                >
                                    <i className="ri-list-check mr-1"></i>
                                    Episodes ({episodes.length})
                                </button>
                            )}
                            {characters.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('characters')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'characters'
                                            ? 'bg-[#f5b048] text-[#1a1a1a]'
                                            : 'text-gray-400 hover:text-[#fbc266]'
                                        }`}
                                >
                                    <i className="ri-team-line mr-1"></i>
                                    Characters ({characters.length})
                                </button>
                            )}
                        </div>

                        {/* Episodes List */}
                        {activeTab === 'episodes' && episodes.length > 0 && (
                            <div className="space-y-2">
                                {episodes.map((ep, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const episodeSlug = ep.url?.split('/').filter(Boolean).pop();
                                            if (episodeSlug) {
                                                navigate(`/watch/${contentType}/${episodeSlug}`, {
                                                    state: { type: contentType }
                                                });
                                            }
                                        }}
                                        className="block w-full bg-[#2a2a2a] rounded-xl p-3 hover:bg-[#333] transition-colors border border-[#333] hover:border-[#f5b048] group text-left"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-[#f5b048]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#f5b048]/20">
                                                <span className="text-[#f5b048] font-bold text-sm">
                                                    {ep.number || ep.full_number || index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-[#fee0ae] truncate">
                                                    {ep.title || `Episode ${ep.number}`}
                                                </h3>
                                                {ep.release_date && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {ep.release_date}
                                                    </p>
                                                )}
                                            </div>
                                            {ep.has_subtitle && (
                                                <span className="text-xs bg-[#fbc266] text-[#1a1a1a] px-2 py-1 rounded-full flex-shrink-0">
                                                    Sub
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Characters List */}
                        {activeTab === 'characters' && characters.length > 0 && (
                            <div className="space-y-3">
                                {characters.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#2a2a2a] rounded-xl p-3 flex items-center gap-3 border border-[#333]"
                                    >
                                        <img
                                            src={item.character?.image}
                                            alt={item.character?.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-[#f5b048]"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-[#fee0ae]">
                                                {item.character?.name}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {item.character?.role}
                                            </p>
                                        </div>
                                        {item.voice_actor && (
                                            <div className="text-right">
                                                <p className="text-xs text-[#fbc266]">Voice Actor</p>
                                                <p className="text-xs text-white truncate max-w-[120px]">
                                                    {item.voice_actor.name?.split('\n')[0]}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-[#fee0ae] mb-3">You Might Also Like</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {recommendations.slice(0, 4).map((rec, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        const recSlug = rec.url?.detail?.split('/').filter(Boolean).pop() ||
                                            rec.url?.split('/').filter(Boolean).pop();
                                        if (recSlug) {
                                            navigate(`/detail/${contentType}/${recSlug}`, {
                                                state: { title: rec.title, type: contentType }
                                            });
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
            </div>

            {/* Scroll to top button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 bg-[#f5b048] text-[#1a1a1a] w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-[#e39923] transition-colors duration-300 z-10"
            >
                <i className="ri-arrow-up-line text-xl"></i>
            </button>
        </div>
    );
}