// src/pages/DetailPage.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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
            navigate(`/watch/${type}/${lastWatched.slug}`)
        } else if (data.episodes?.length > 0) {
            const firstEp = data.episodes[0]
            const epSlug = extractEpisodeSlug(firstEp)
            navigate(`/watch/${type}/${epSlug}`)
        }
    }

    const handleEpisodeClick = (episode) => {
        const epSlug = extractEpisodeSlug(episode)
        const watchData = {
            slug: epSlug,
            number: episode.episode || episode.number,
            title: episode.title,
            thumbnail: episode.thumbnail || data.image,
            timestamp: Date.now()
        }
        localStorage.setItem(`lastWatched_${type}_${slug}`, JSON.stringify(watchData))
        navigate(`/watch/${type}/${epSlug}`)
    }

    const extractEpisodeSlug = (episode) => {
        if (type === 'anime') {
            const url = episode.url || episode.full_title || ''
            const matches = url.match(/\/([^\/]+?)(?:\/?)$/)
            return matches ? matches[1] : ''
        } else {
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
            let recSlug = ''
            let recType = 'anime'

            if (item.url) {
                if (typeof item.url === 'string') {
                    if (item.url.includes('samehadaku')) {
                        const matches = item.url.match(/\/(?:anime|donghua)\/([^\/]+)/)
                        recSlug = matches ? matches[1] : ''
                        recType = 'anime'
                    } else if (item.url.includes('anichin.moe')) {
                        const matches = item.url.match(/https:\/\/anichin\.moe\/([^\/]+)/)
                        recSlug = matches ? matches[1] : ''
                        recType = 'donghua'
                    }
                } else if (item.url?.detail) {
                    const matches = item.url.detail.match(/https:\/\/anichin\.moe\/([^\/]+)/)
                    recSlug = matches ? matches[1] : ''
                    recType = 'donghua'
                }
            }

            if (!recSlug) {
                if (item.source === 'anichin') {
                    recType = 'donghua'
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

    const sortedEpisodes = [...episodes].sort((a, b) => {
        const numA = parseInt(isAnime ? a.episode : a.number)
        const numB = parseInt(isAnime ? b.episode : b.number)
        return numA - numB
    })

    return (
        <div className="min-h-screen bg-mykisah-bg-primary text-mykisah-text-primary pb-20">
            {/* Hero Section dengan Poster Full */}
            <div className="relative h-[320px] md:h-[200px]">
                {/* Background Image dengan Blur */}
                <div
                    className="absolute inset-0 bg-cover bg-[center_30%]"
                    style={{ backgroundImage: `url(${image})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-mykisah-bg-primary via-mykisah-bg-primary/80 to-transparent"></div>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10"
                >
                    <i className="ri-arrow-left-line text-xl text-white"></i>
                </button>

                {/* Action Buttons Top Right */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <i className="ri-bookmark-line text-xl text-white"></i>
                    </button>
                    <button className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <i className="ri-share-line text-xl text-white"></i>
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 mt-[7px] relative z-10">
                <h1 className="text-2xl font-bold mb-1 text-white drop-shadow-lg">{title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-mykisah-text-secondary mb-3">
                    <span className="text-mykisah-primary font-bold flex items-center gap-1">
                        <i className="ri-star-fill"></i>
                        {isAnime ? data.details?.rating || 'N/A' : data.rating?.value || 'N/A'}
                    </span>
                    • {isAnime ? data.details?.released : data.info?.released} • {isAnime ? data.details?.studio : data.info?.studio}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                    {/* Play Button */}
                    <button
                        onClick={handlePlayClick}
                        className="flex-1 py-2 bg-mykisah-primary text-black rounded-full font-medium flex items-center justify-center gap-2 hover:bg-mykisah-accent transition-colors"
                    >
                        <i className="ri-play-circle-line text-lg"></i>
                        <span>
                            {lastWatched ? (
                                <>Lanjut Ep {formatNumber(lastWatched.number)}</>
                            ) : (
                                <>Play</>
                            )}
                        </span>
                    </button>

                    {/* Download Button */}
                    <button className="flex-1 py-2.5 border border-mykisah-primary text-mykisah-primary bg-transparent rounded-full font-medium flex items-center justify-center gap-2 hover:bg-mykisah-primary/10 transition-colors">
                        <i className="ri-download-2-line text-lg"></i>
                        <span>Download</span>
                    </button>
                </div>

                {/* Synopsis */}
                <div className="mb-2">
                    <p className="font-semibold text-[15px]">Genre: {genres.join(', ')}</p>
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
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-0 z-10 bg-mykisah-bg-primary/80 backdrop-blur-md border-b border-mykisah-bg-tertiary">
                <div className="flex px-5">
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