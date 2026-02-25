// src/pages/DetailPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

export default function DetailPage() {
    const { type, slug } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('episodes')
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [lastWatched, setLastWatched] = useState(null)

    useEffect(() => {
        fetchDetail()
        // Load last watched episode from localStorage
        const saved = localStorage.getItem(`lastWatched_${type}_${slug}`)
        if (saved) {
            setLastWatched(JSON.parse(saved))
        }
    }, [type, slug])

    const fetchDetail = async () => {
        setLoading(true)
        try {
            const baseUrl = 'https://api-samehadaku-how-anichin.vercel.app/api'
            const endpoint = type === 'anime'
                ? `${baseUrl}/anime/detail/${slug}`
                : `${baseUrl}/donghua/detail/${slug}`

            const res = await fetch(endpoint)
            const json = await res.json()
            setData(json.data)
        } catch (error) {
            console.error('Error fetching detail:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePlayClick = () => {
        if (lastWatched) {
            // Navigate to last watched episode
            navigate(`/watch/${type}/${lastWatched.slug}`)
        } else if (data.episodes?.length > 0) {
            // Navigate to first episode
            const firstEp = data.episodes[0]
            const epSlug = extractEpisodeSlug(firstEp)
            navigate(`/watch/${type}/${epSlug}`)
        }
    }

    const handleEpisodeClick = (episode) => {
        const epSlug = extractEpisodeSlug(episode)

        // Save to localStorage
        const watchData = {
            slug: epSlug,
            number: episode.episode || episode.number,
            title: episode.title,
            thumbnail: episode.thumbnail || data.image,
            timestamp: Date.now()
        }
        localStorage.setItem(`lastWatched_${type}_${slug}`, JSON.stringify(watchData))

        // Navigate to watch page
        navigate(`/watch/${type}/${epSlug}`)
    }

    const extractEpisodeSlug = (episode) => {
        if (type === 'anime') {
            // From anime URL: https://v1.samehadaku.how/omae-gotoki-ga-maou-ni-kateru-to-omouna-episode-6/
            const url = episode.url || episode.full_title || ''
            const matches = url.match(/\/([^\/]+?)(?:\/?)$/)
            return matches ? matches[1] : ''
        } else {
            // From donghua URL: https://anichin.moe/martial-god-asura-season-2-episode-03-subtitle-indonesia/
            const url = episode.url || ''
            const matches = url.match(/https:\/\/anichin\.moe\/([^\/]+)/)
            return matches ? matches[1] : ''
        }
    }

    const formatNumber = (num) => {
        if (!num) return '00'
        return num.toString().padStart(2, '0')
    }

    const getInfoItems = () => {
        if (!data) return []

        if (type === 'anime') {
            const d = data.details || {}
            return [
                { label: 'Japanese', value: d.japanese },
                { label: 'English', value: d.english },
                { label: 'Status', value: d.status },
                { label: 'Type', value: d.type },
                { label: 'Source', value: d.source },
                { label: 'Duration', value: d.duration },
                { label: 'Total Episodes', value: d.total_episode },
                { label: 'Season', value: d.season },
                { label: 'Studio', value: d.studio },
                { label: 'Producers', value: d.producers },
                { label: 'Released', value: d.released },
                { label: 'Rating', value: d.rating }
            ]
        } else {
            const i = data.info || {}
            return [
                { label: 'Status', value: i.status },
                { label: 'Type', value: i.type },
                { label: 'Studio', value: i.studio },
                { label: 'Network', value: i.network },
                { label: 'Released', value: i.released },
                { label: 'Duration', value: i.duration },
                { label: 'Season', value: i.season },
                { label: 'Country', value: i.country },
                { label: 'Total Episodes', value: i.total_episodes },
                { label: 'Fansub', value: i.fansub },
                { label: 'Posted By', value: i.posted_by },
                { label: 'Rating', value: data.rating?.value ? `${data.rating.value} (${data.rating.votes} votes)` : 'N/A' }
            ]
        }
    }

    const RecommendationCard = ({ item }) => {
        const handleRecommendationClick = () => {
            // Extract slug from URL
            let recSlug = ''
            let recType = 'anime' // default

            if (item.url) {
                // Handle different URL formats
                if (typeof item.url === 'string') {
                    // For anime (samehadaku)
                    if (item.url.includes('samehadaku')) {
                        const matches = item.url.match(/\/(?:anime|donghua)\/([^\/]+)/)
                        recSlug = matches ? matches[1] : ''
                        recType = 'anime'
                    }
                    // For donghua (anichin)
                    else if (item.url.includes('anichin.moe')) {
                        const matches = item.url.match(/https:\/\/anichin\.moe\/([^\/]+)/)
                        recSlug = matches ? matches[1] : ''
                        recType = 'donghua'
                    }
                }
                // Handle object format (some donghua have url as object)
                else if (item.url?.detail) {
                    const matches = item.url.detail.match(/https:\/\/anichin\.moe\/([^\/]+)/)
                    recSlug = matches ? matches[1] : ''
                    recType = 'donghua'
                }
            }

            // Alternative: use item.source to determine type
            if (!recSlug) {
                if (item.source === 'anichin') {
                    recType = 'donghua'
                    // Try to get from title as fallback
                    recSlug = item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                } else {
                    recType = 'anime'
                    recSlug = item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                }
            }

            if (recSlug) {
                navigate(`/detail/${recType}/${recSlug}`)
            }
        }

        return (
            <div
                onClick={handleRecommendationClick}
                className="bg-mykisah-bg-secondary rounded-xl overflow-hidden shadow-lg border border-mykisah-bg-tertiary flex-shrink-0 w-36 hover:border-mykisah-primary transition-all duration-300 cursor-pointer"
            >
                <div className="relative">
                    <img
                        src={item.image || item.thumbnail}
                        alt={item.title}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
                        }}
                    />
                </div>
                <div className="p-2">
                    <h4 className="text-mykisah-text-primary text-xs font-semibold line-clamp-2 mb-1">{item.title}</h4>
                    <p className="text-mykisah-text-secondary text-[10px]">{item.date || item.info || ''}</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-mykisah-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-mykisah-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-mykisah-text-primary">Loading...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-mykisah-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <i className="ri-error-warning-line text-6xl text-mykisah-primary mb-4"></i>
                    <p className="text-mykisah-text-primary mb-2">Data tidak ditemukan</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-mykisah-primary text-black rounded-lg font-semibold"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        )
    }

    const isAnime = type === 'anime'
    const title = data.title
    const image = data.image
    const description = data.description || data.synopsis?.[0] || ''
    const genres = data.genres || []
    const episodes = data.episodes || []
    const recommendations = data.recommendations || []
    const infoItems = getInfoItems()

    // Sort episodes by number (ascending)
    const sortedEpisodes = [...episodes].sort((a, b) => {
        const numA = parseInt(isAnime ? a.episode : a.number)
        const numB = parseInt(isAnime ? b.episode : b.number)
        return numA - numB
    })

    return (
        <div className="min-h-screen bg-mykisah-bg-primary text-mykisah-text-primary pb-20">
            {/* Header dengan back button */}
            <div className="sticky top-0 z-10 bg-mykisah-bg-primary/80 backdrop-blur-md border-b border-mykisah-bg-tertiary px-4 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-mykisah-tertiary hover:text-mykisah-primary transition-colors"
                    >
                        <i className="ri-arrow-left-line text-2xl"></i>
                    </button>
                    <h1 className="text-lg font-semibold truncate flex-1">
                        <span className="text-white">My</span>
                        <span className="text-mykisah-primary">Kisah</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <button className="text-mykisah-tertiary hover:text-mykisah-primary transition-colors">
                            <i className="ri-share-line text-xl"></i>
                        </button>
                        <button className="text-mykisah-tertiary hover:text-mykisah-primary transition-colors">
                            <i className="ri-bookmark-line text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative">
                {/* Background Blur */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
                    style={{ backgroundImage: `url(${image})` }}
                ></div>

                {/* Content */}
                <div className="relative px-4 py-6 flex gap-4">
                    {/* Poster */}
                    <div className="w-32 flex-shrink-0">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-40 object-cover rounded-xl shadow-2xl border-2 border-mykisah-primary/20"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'
                            }}
                        />
                    </div>

                    
                </div>
            </div>
            <div>
                <h1 className="text-xl font-bold mb-2 line-clamp-2">{title}</h1>
            </div>

            <div>
                <div className="text-mykisah-primary font-bold">
                    ⭐ {isAnime ? data.details?.rating || 'N/A' : data.rating?.value || 'N/A'} - tahun rilisnya (misal oct 5 2025 to ditulis jadi oct 2025) - nama studio - {isAnime ? data.details?.status : data.info?.status}
                </div>
            </div>

            {/* Action Buttons - UPDATED */}
            <div className="flex gap-2">
                <button
                    onClick={handlePlayClick}
                    className="flex-1 py-2 bg-mykisah-primary text-black rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-mykisah-accent transition-colors"
                >
                    <i className="ri-play-circle-line"></i>
                    <span>
                        {lastWatched ? (
                            <>Continue EP {formatNumber(lastWatched.number)}</>
                        ) : (
                            <>Start Watching</>
                        )}
                    </span>
                </button>
                <button className="flex-1 py-2 bg-mykisah-bg-secondary text-mykisah-primary rounded-lg font-semibold border border-mykisah-bg-tertiary hover:bg-mykisah-bg-tertiary transition-colors">
                    <i className="ri-download-2-line"></i>
                    <span className="ml-1">Download</span>
                </button>
            </div>

            {/* Last watched indicator */}
            {lastWatched && (
                <div className="mt-2 text-xs text-mykisah-text-secondary flex items-center gap-1">
                    <i className="ri-history-line"></i>
                    <span>Last watched: EP {formatNumber(lastWatched.number)}</span>
                </div>
            )}

            {/* Synopsis */}
            <div className="px-4 py-4 border-b border-mykisah-bg-tertiary">
                <h2 className="font-medium">Genre: (genre2nya pindah sini) {genres.slice(0, 3).map((genre, idx) => (
                    <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-mykisah-bg-tertiary text-mykisah-secondary rounded-full"
                    >
                        {genre}
                    </span>
                ))}
                    {genres.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-mykisah-bg-tertiary text-mykisah-text-secondary rounded-full">
                            +{genres.length - 3}
                        </span>
                    )}</h2>
                <p className={`text-sm text-mykisah-text-secondary leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
                    {description}
                </p>
                {description.length > 200 && (
                    <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-mykisah-primary text-sm mt-2 font-semibold"
                    >
                        {showFullDescription ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-[72px] z-10 bg-mykisah-bg-primary/80 backdrop-blur-md border-b border-mykisah-bg-tertiary">
                <div className="flex px-4">
                    <button
                        onClick={() => setActiveTab('episodes')}
                        className={`flex-1 py-3 font-semibold relative ${activeTab === 'episodes'
                                ? 'text-mykisah-primary'
                                : 'text-mykisah-text-secondary'
                            }`}
                    >
                        Episodes
                        {activeTab === 'episodes' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mykisah-primary"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 font-semibold relative ${activeTab === 'details'
                                ? 'text-mykisah-primary'
                                : 'text-mykisah-text-secondary'
                            }`}
                    >
                        Details
                        {activeTab === 'details' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mykisah-primary"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('recommendations')}
                        className={`flex-1 py-3 font-semibold relative ${activeTab === 'recommendations'
                                ? 'text-mykisah-primary'
                                : 'text-mykisah-text-secondary'
                            }`}
                    >
                        Related
                        {activeTab === 'recommendations' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mykisah-primary"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 py-4">
                {activeTab === 'episodes' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-mykisah-tertiary font-semibold">Episode List</h2>
                            <span className="text-xs text-mykisah-text-secondary">{episodes.length} episodes</span>
                        </div>
                        <div className="space-y-2">
                            {sortedEpisodes.map((ep, idx) => {
                                const epNumber = isAnime ? ep.episode : ep.number
                                const isWatched = lastWatched?.number === epNumber

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleEpisodeClick(ep)}
                                        className={`bg-mykisah-bg-secondary p-3 rounded-lg border transition-colors cursor-pointer ${isWatched
                                                ? 'border-mykisah-primary bg-mykisah-primary/10'
                                                : 'border-mykisah-bg-tertiary hover:border-mykisah-primary'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isWatched ? 'bg-mykisah-primary' : 'bg-mykisah-primary/20'
                                                }`}>
                                                <span className={`font-bold text-sm ${isWatched ? 'text-black' : 'text-mykisah-primary'
                                                    }`}>
                                                    {formatNumber(epNumber)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                                                    {ep.title}
                                                    {isWatched && (
                                                        <span className="text-xs text-mykisah-primary flex items-center gap-1">
                                                            <i className="ri-check-line"></i> Watched
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-mykisah-text-secondary">
                                                    {ep.date || ep.release_date}
                                                </p>
                                            </div>
                                            <button className="text-mykisah-primary">
                                                <i className="ri-play-circle-line text-xl"></i>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'details' && (
                    <div>
                        <h2 className="text-mykisah-tertiary font-semibold mb-4">Information</h2>
                        <div className="bg-mykisah-bg-secondary rounded-xl border border-mykisah-bg-tertiary divide-y divide-mykisah-bg-tertiary">
                            {infoItems.map((item, idx) => (
                                item.value && (
                                    <div key={idx} className="flex items-start p-3">
                                        <span className="text-xs text-mykisah-text-secondary w-24 flex-shrink-0">
                                            {item.label}
                                        </span>
                                        <span className="text-sm text-mykisah-text-primary flex-1">
                                            {item.value}
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>

                        {!isAnime && data.tags && data.tags.length > 0 && (
                            <>
                                <h2 className="text-mykisah-tertiary font-semibold mt-6 mb-4">Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {data.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-3 py-1.5 bg-mykisah-bg-secondary text-mykisah-secondary rounded-full border border-mykisah-bg-tertiary"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'recommendations' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-mykisah-tertiary font-semibold">You Might Also Like</h2>
                            <span className="text-xs text-mykisah-text-secondary">{recommendations.length} items</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {recommendations.map((item, idx) => (
                                <RecommendationCard key={idx} item={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}