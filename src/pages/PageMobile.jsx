import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PageMobile() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('anime')
    const [animeData, setAnimeData] = useState([])
    const [donghuaData, setDonghuaData] = useState([])
    const [loading, setLoading] = useState({ anime: false, donghua: false })
    const [pagination, setPagination] = useState({ anime: {}, donghua: {} })

    useEffect(() => {
        fetchAnime()
        fetchDonghua()
    }, [])

    const fetchAnime = async (page = 1) => {
        setLoading(prev => ({ ...prev, anime: true }))
        try {
            const response = await fetch(`https://apinimeee.vercel.app/api/anime/latest-release?page=${page}`)
            const data = await response.json()
            if (data.success) {
                setAnimeData(prev => page === 1 ? data.data : [...prev, ...data.data])
                setPagination(prev => ({ ...prev, anime: data.pagination }))
            }
        } catch (error) {
            console.error('Error fetching anime:', error)
        } finally {
            setLoading(prev => ({ ...prev, anime: false }))
        }
    }

    const fetchDonghua = async (page = 1) => {
        setLoading(prev => ({ ...prev, donghua: true }))
        try {
            const response = await fetch(`https://apinimeee.vercel.app/api/donghua/latest-release?page=${page}`)
            const data = await response.json()
            if (data.success) {
                setDonghuaData(prev => page === 1 ? data.data : [...prev, ...data.data])
                setPagination(prev => ({ ...prev, donghua: data.pagination }))
            }
        } catch (error) {
            console.error('Error fetching donghua:', error)
        } finally {
            setLoading(prev => ({ ...prev, donghua: false }))
        }
    }

    const loadMore = () => {
        if (activeTab === 'anime' && pagination.anime?.has_next) {
            fetchAnime(pagination.anime.current + 1)
        } else if (activeTab === 'donghua' && pagination.donghua?.has_next) {
            fetchDonghua(pagination.donghua.current + 1)
        }
    }

    const AnimeCard = ({ item }) => {
        // Untuk Anime
        const title = item.title || item.series?.title
        const imageUrl = item.image
        const type = item.type || 'Donghua'
        const isHot = item.is_hot

        // Handle different data structures for anime and donghua
        let episodeNumber = ''
        let watchUrl = ''
        let subBadge = ''
        let status = ''
        let slug = ''

        if (item.episode && typeof item.episode === 'object') {
            // Donghua structure
            episodeNumber = item.episode.full_episode || `Ep ${item.episode.number}`
            watchUrl = item.episode.url
            subBadge = item.episode.sub_badge
            status = item.episode.status || 'Ongoing'
            // Extract slug from series URL for donghua
            slug = item.series?.url?.split('/').filter(Boolean).pop() || ''
        } else {
            // Anime structure
            episodeNumber = item.episode || 'Episode'
            watchUrl = item.url?.episode
            subBadge = item.sub_badge
            status = item.status || 'Ongoing'
            // Extract slug from series URL for anime
            slug = item.url?.series?.split('/').filter(Boolean).pop() || ''
        }

        const handleCardClick = () => {
            if (slug) {
                const contentType = item.source === 'anichin' ? 'donghua' : 'anime'
                navigate(`/detail/${contentType}/${slug}`, {
                    state: {
                        title: title,
                        type: contentType
                    }
                })
            }
        }

        return (
            <div
                onClick={handleCardClick}
                className="bg-[#2a2a2a] rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#f5b048]/20 border border-[#333] hover:border-[#f5b048] group cursor-pointer"
            >
                <div className="relative pt-[140%] bg-[#333]">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/247x350?text=No+Image'
                        }}
                    />

                    {/* Episode Badge */}
                    <span className="absolute top-2 left-2 bg-[#e39923] text-[#1a1a1a] px-2 py-1 rounded text-xs font-bold">
                        {episodeNumber}
                    </span>

                    {/* Type Badge */}
                    <span className="absolute top-2 right-2 bg-[#f5b048] text-[#1a1a1a] px-2 py-1 rounded text-xs font-bold">
                        {type}
                    </span>

                    {/* Sub Badge */}
                    {subBadge && (
                        <span className="absolute bottom-2 right-2 bg-[#fbc266] text-[#1a1a1a] px-2 py-1 rounded text-xs font-bold">
                            {subBadge}
                        </span>
                    )}
                </div>

                <div className="p-3">
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2 text-[#fee0ae]">
                        {title}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400">
                            {status}
                        </span>
                        {isHot && (
                            <span className="text-xs text-[#fbc266] flex items-center gap-1">
                                <i className="ri-fire-fill"></i>
                                Hot
                            </span>
                        )}
                    </div>


                    {watchUrl && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Extract episode slug from URL
                                const episodeSlug = watchUrl.split('/').filter(Boolean).pop();
                                const contentType = item.source === 'anichin' ? 'donghua' : 'anime';
                                navigate(`/watch/${contentType}/${episodeSlug}`, {
                                    state: {
                                        type: contentType,
                                        episodeTitle: episodeNumber,
                                        seriesTitle: title
                                    }
                                });
                            }}
                            className="block w-full text-center py-2 bg-[#f5b048] text-[#1a1a1a] rounded-lg text-sm font-semibold hover:bg-[#e39923] transition-colors duration-300"
                        >
                            <i className="ri-play-circle-line mr-1"></i>
                            Watch Now
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-4 font-sans pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold text-[#fee0ae] flex items-center gap-2">
                    <i className="ri-movie-2-line text-[#f5b048]"></i>
                    Streaming Anime
                </h1>
                <button
                    onClick={() => navigate('/search')}
                    className="text-[#fbc266] hover:text-[#f5b048] transition-colors"
                >
                    <i className="ri-search-line text-xl"></i>
                </button>

            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-[#2a2a2a] p-1 rounded-xl mb-5">
                <button
                    onClick={() => setActiveTab('anime')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'anime'
                            ? 'bg-[#f5b048] text-[#1a1a1a]'
                            : 'text-gray-400 hover:text-[#fbc266]'
                        }`}
                >
                    <i className="ri-movie-line"></i>
                    Anime
                    {animeData.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'anime' ? 'bg-[#e39923]' : 'bg-[#333]'
                            }`}>
                            {animeData.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('donghua')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'donghua'
                            ? 'bg-[#f5b048] text-[#1a1a1a]'
                            : 'text-gray-400 hover:text-[#fbc266]'
                        }`}
                >
                    <i className="ri-ancient-pavilion-line"></i>
                    Donghua
                    {donghuaData.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'donghua' ? 'bg-[#e39923]' : 'bg-[#333]'
                            }`}>
                            {donghuaData.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="space-y-5">
                {/* Grid Content */}
                {animeData.length === 0 && donghuaData.length === 0 && !loading.anime && !loading.donghua ? (
                    <div className="text-center py-16">
                        <i className="ri-emotion-sad-line text-5xl text-[#fbc266] mb-4"></i>
                        <p className="text-gray-400">No data available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {activeTab === 'anime' && animeData.map((item, index) => (
                            <AnimeCard key={`anime-${index}`} item={item} />
                        ))}

                        {activeTab === 'donghua' && donghuaData.map((item, index) => (
                            <AnimeCard key={`donghua-${index}`} item={item} />
                        ))}
                    </div>
                )}

                {/* Loading State */}
                {loading[activeTab] && (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 border-3 border-[#333] border-t-[#f5b048] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#fbc266]">Loading...</p>
                    </div>
                )}

                {/* Load More Button */}
                {!loading[activeTab] && (
                    (activeTab === 'anime' ? pagination.anime?.has_next : pagination.donghua?.has_next) && (
                        <button
                            onClick={loadMore}
                            className="block w-full max-w-[200px] mx-auto mt-5 px-6 py-3 bg-transparent border-2 border-[#f5b048] text-[#f5b048] rounded-lg font-semibold hover:bg-[#f5b048] hover:text-[#1a1a1a] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <i className="ri-refresh-line"></i>
                            Load More
                        </button>
                    )
                )}
            </div>

            {/* Scroll to top button - muncul setelah scroll */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 bg-[#f5b048] text-[#1a1a1a] w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-[#e39923] transition-colors duration-300"
            >
                <i className="ri-arrow-up-line text-xl"></i>
            </button>
        </div>
    )
}