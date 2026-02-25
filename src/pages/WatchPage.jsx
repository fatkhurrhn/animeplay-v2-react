// src/pages/WatchPage.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function WatchPage() {
    const { type, slug } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedStream, setSelectedStream] = useState(null)
    const [showQualityMenu, setShowQualityMenu] = useState(false)
    const [showDownloadMenu, setShowDownloadMenu] = useState(false)
    const [liked, setLiked] = useState(false)
    const [disliked, setDisliked] = useState(false)
    const [subscribed, setSubscribed] = useState(false)
    const [activeFormat, setActiveFormat] = useState('mkv')
    const [videoError, setVideoError] = useState(false)
    const videoRef = useRef(null)

    useEffect(() => {
        fetchWatchData()
    }, [type, slug])

    useEffect(() => {
        // Auto play video when stream changes - only for video elements
        if (selectedStream && videoRef.current && videoRef.current.tagName === 'VIDEO') {
            videoRef.current.load()
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e))
        }
    }, [selectedStream])

    const fetchWatchData = async () => {
        setLoading(true)
        try {
            const baseUrl = 'https://api-samehadaku-how-anichin.vercel.app/api'
            const endpoint = type === 'anime'
                ? `${baseUrl}/anime/watch/${slug}`
                : `${baseUrl}/donghua/watch/${slug}`

            const res = await fetch(endpoint)
            const json = await res.json()
            setData(json.data)

            // Set default stream
            if (json.data?.streams?.length > 0) {
                // Prefer main stream without ADS
                const mainStream = json.data.streams.find(s => s.type === 'main' || !s.type?.includes('ads')) || json.data.streams[0]
                setSelectedStream(mainStream)
            }
        } catch (error) {
            console.error('Error fetching watch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const extractEpisodeNumber = (url) => {
        const matches = url.match(/episode[-\s]?(\d+)/i) || url.match(/-(\d+)-/) || url.match(/(\d+)$/)
        return matches ? matches[1] : ''
    }

    const getEmbedUrl = (stream) => {
        if (!stream) return ''

        // Handle different stream types
        if (stream.url.includes('youtube.com') || stream.url.includes('youtu.be')) {
            return stream.url.replace('watch?v=', 'embed/')
        }
        if (stream.url.includes('mega.nz')) {
            return stream.url
        }
        if (stream.url.includes('ok.ru')) {
            return stream.url
        }
        if (stream.url.includes('dailymotion.com')) {
            return stream.url
        }
        if (stream.url.includes('rumble.com')) {
            return stream.url
        }
        if (stream.url.includes('blogger.com')) {
            return stream.url
        }
        return stream.url
    }

    const formatNumber = (num) => {
        if (!num) return '00'
        return num.toString().padStart(2, '0')
    }

    const handleLike = () => {
        if (liked) {
            setLiked(false)
        } else {
            setLiked(true)
            setDisliked(false)
        }
    }

    const handleDislike = () => {
        if (disliked) {
            setDisliked(false)
        } else {
            setDisliked(true)
            setLiked(false)
        }
    }

    const handleReport = () => {
        alert('Report has been sent to admin. Thank you for your feedback!')
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
    }

    const scrollToEpisode = (index) => {
        const container = document.getElementById('episodes-container')
        const element = document.getElementById(`episode-${index}`)
        if (container && element) {
            const containerWidth = container.offsetWidth
            const elementLeft = element.offsetLeft
            const elementWidth = element.offsetWidth
            container.scrollTo({
                left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
                behavior: 'smooth'
            })
        }
    }

    useEffect(() => {
        if (data?.other_episodes || data?.related_episodes) {
            const episodes = data.other_episodes || data.related_episodes || []
            const currentIndex = episodes.findIndex(ep => {
                if (type === 'anime') {
                    return ep.url === data.episode?.url
                } else {
                    return ep.number === data.episode?.number
                }
            })
            if (currentIndex !== -1) {
                setTimeout(() => scrollToEpisode(currentIndex), 500)
            }
        }
    }, [data])

    if (loading) {
        return (
            <div className="min-h-screen bg-mykisah-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-mykisah-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-mykisah-text-primary">Loading video...</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-mykisah-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <i className="ri-error-warning-line text-6xl text-mykisah-primary mb-4"></i>
                    <p className="text-mykisah-text-primary mb-2">Video tidak ditemukan</p>
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
    const episode = data.episode || {}
    const series = data.series || {}
    const streams = data.streams || []
    const downloads = isAnime ? data.downloads : data.downloads || []
    const otherEpisodes = isAnime ? data.other_episodes || [] : data.related_episodes || []
    const recommendations = data.recommendations || []

    // Sort episodes by number
    const sortedEpisodes = [...otherEpisodes].sort((a, b) => {
        const numA = parseInt(isAnime ? extractEpisodeNumber(a.url) : a.number)
        const numB = parseInt(isAnime ? extractEpisodeNumber(b.url) : b.number)
        return numA - numB
    })

    // Get current episode index
    const currentEpisodeIndex = sortedEpisodes.findIndex(ep => {
        if (isAnime) {
            return ep.url === data.episode?.url
        } else {
            return ep.number === data.episode?.number
        }
    })

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

    return (
        <div className="min-h-screen bg-mykisah-bg-primary text-mykisah-text-primary pb-20">
            {/* Video Player - FULL WIDTH NO HEADER */}
            <div className="sticky top-0 z-20 bg-black w-full">
                <div className="relative pt-[56.25%] bg-black">
                    {selectedStream ? (
                        selectedStream.url.includes('mega.nz') ||
                            selectedStream.url.includes('ok.ru') ||
                            selectedStream.url.includes('blogger.com') ||
                            selectedStream.url.includes('dailymotion') ||
                            selectedStream.url.includes('youtube') ||
                            selectedStream.url.includes('rumble') ? (
                            <iframe
                                src={getEmbedUrl(selectedStream)}
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; encrypted-media; picture-in-picture"
                                title={episode.title}
                                onError={() => setVideoError(true)}
                            ></iframe>
                        ) : (
                            <video
                                ref={videoRef}
                                className="absolute top-0 left-0 w-full h-full"
                                controls
                                autoPlay
                                playsInline
                                src={selectedStream.url}
                                poster={episode.image || series.thumbnail}
                                onError={() => setVideoError(true)}
                            >
                                <source src={selectedStream.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )
                    ) : (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-mykisah-bg-secondary">
                            <p className="text-mykisah-text-secondary">No stream available</p>
                        </div>
                    )}
                </div>

                {/* Back Button - Overlay on video */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-2 left-2 z-30 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-mykisah-primary/80 transition-colors backdrop-blur-sm"
                >
                    <i className="ri-arrow-left-line text-lg"></i>
                </button>
            </div>

            {/* Content Below Video */}
            <div className="px-4 py-4">
                {/* Title and Metadata */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold mb-1">{episode.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-mykisah-text-secondary">
                        <span>{episode.release_date || data.episode?.release_date}</span>
                        <span>•</span>
                        <span>{episode.author || episode.posted_by || data.episode?.posted_by}</span>
                        <span>•</span>
                        <span className="text-mykisah-primary">{streams.length} servers</span>
                    </div>
                </div>

                {/* Synopsis - TEPAT DI ATAS ACTION BUTTONS */}
                {series.synopsis && (
                    <div className="mb-4">
                        <p className="text-sm text-mykisah-text-secondary leading-relaxed line-clamp-2">
                            {series.synopsis}
                        </p>
                        <button className="text-mykisah-primary text-xs mt-1">Read more</button>
                    </div>
                )}

                {/* Action Buttons - Like YouTube */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                    {/* Like/Dislike */}
                    <div className="flex bg-mykisah-bg-secondary rounded-full border border-mykisah-bg-tertiary">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 px-4 py-2 rounded-l-full transition-colors ${liked ? 'text-mykisah-primary' : 'text-mykisah-text-secondary hover:text-mykisah-primary'
                                }`}
                        >
                            <i className={`${liked ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} text-xl`}></i>
                            <span className="text-sm">{liked ? '123' : '122'}</span>
                        </button>
                        <div className="w-px h-6 bg-mykisah-bg-tertiary my-auto"></div>
                        <button
                            onClick={handleDislike}
                            className={`flex items-center gap-1 px-4 py-2 rounded-r-full transition-colors ${disliked ? 'text-mykisah-primary' : 'text-mykisah-text-secondary hover:text-mykisah-primary'
                                }`}
                        >
                            <i className={`${disliked ? 'ri-thumb-down-fill' : 'ri-thumb-down-line'} text-xl`}></i>
                        </button>
                    </div>

                    {/* Subscribe */}
                    <button
                        onClick={() => setSubscribed(!subscribed)}
                        className={`flex items-center gap-1 px-4 py-2 rounded-full transition-colors whitespace-nowrap ${subscribed
                                ? 'bg-mykisah-bg-tertiary text-mykisah-text-secondary'
                                : 'bg-mykisah-primary text-black'
                            }`}
                    >
                        <i className={`${subscribed ? 'ri-notification-off-line' : 'ri-notification-3-line'} text-xl`}></i>
                        <span className="text-sm">{subscribed ? 'Subscribed' : 'Subscribe'}</span>
                    </button>

                    {/* Quality + Server Menu - POPUP FROM BOTTOM */}
                    <div className="relative">
                        <button
                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                            className="flex items-center gap-1 px-4 py-2 bg-mykisah-bg-secondary rounded-full border border-mykisah-bg-tertiary text-mykisah-text-secondary hover:text-mykisah-primary transition-colors whitespace-nowrap"
                        >
                            <i className="ri-hd-line text-xl"></i>
                            <span className="text-sm">Quality</span>
                        </button>
                        {showQualityMenu && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 bg-black/50 z-40"
                                    onClick={() => setShowQualityMenu(false)}
                                ></div>
                                {/* Bottom Sheet */}
                                <div className="fixed bottom-0 left-0 right-0 bg-mykisah-bg-secondary rounded-t-xl border-t border-mykisah-bg-tertiary z-50 animate-slide-up">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold">Select Server</h3>
                                            <button onClick={() => setShowQualityMenu(false)}>
                                                <i className="ri-close-line text-xl"></i>
                                            </button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {streams.map((stream, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setSelectedStream(stream)
                                                        setShowQualityMenu(false)
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${selectedStream?.url === stream.url
                                                            ? 'bg-mykisah-primary text-black'
                                                            : 'hover:bg-mykisah-bg-tertiary'
                                                        }`}
                                                >
                                                    <div className="font-semibold">{stream.server}</div>
                                                    {stream.quality && stream.quality !== 'unknown' && (
                                                        <div className="text-xs opacity-70">{stream.quality}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Download Menu - POPUP FROM BOTTOM */}
                    {data.has_downloads && (
                        <div className="relative">
                            <button
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                className="flex items-center gap-1 px-4 py-2 bg-mykisah-bg-secondary rounded-full border border-mykisah-bg-tertiary text-mykisah-text-secondary hover:text-mykisah-primary transition-colors whitespace-nowrap"
                            >
                                <i className="ri-download-2-line text-xl"></i>
                                <span className="text-sm">Download</span>
                            </button>
                            {showDownloadMenu && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 bg-black/50 z-40"
                                        onClick={() => setShowDownloadMenu(false)}
                                    ></div>
                                    {/* Bottom Sheet */}
                                    <div className="fixed bottom-0 left-0 right-0 bg-mykisah-bg-secondary rounded-t-xl border-t border-mykisah-bg-tertiary z-50 animate-slide-up max-h-[80vh] overflow-y-auto">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-mykisah-bg-secondary pt-2">
                                                <h3 className="text-lg font-semibold">Download</h3>
                                                <button onClick={() => setShowDownloadMenu(false)}>
                                                    <i className="ri-close-line text-xl"></i>
                                                </button>
                                            </div>

                                            {!isAnime && downloads[0] && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold mb-2">{downloads[0].title}</h4>
                                                </div>
                                            )}

                                            {isAnime ? (
                                                <>
                                                    {/* Format tabs for anime */}
                                                    <div className="flex gap-1 mb-4 sticky top-12 bg-mykisah-bg-secondary py-2">
                                                        {Object.keys(downloads).map(format => (
                                                            <button
                                                                key={format}
                                                                onClick={() => setActiveFormat(format)}
                                                                className={`flex-1 py-2 text-sm rounded-lg ${activeFormat === format
                                                                        ? 'bg-mykisah-primary text-black'
                                                                        : 'bg-mykisah-bg-tertiary text-mykisah-text-secondary'
                                                                    }`}
                                                            >
                                                                {format.toUpperCase()}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Quality list */}
                                                    {downloads[activeFormat]?.map((item, idx) => (
                                                        <div key={idx} className="mb-4">
                                                            <h5 className="text-sm text-mykisah-tertiary mb-2 font-semibold">{item.quality}</h5>
                                                            <div className="space-y-2">
                                                                {item.links.map((link, linkIdx) => (
                                                                    <a
                                                                        key={linkIdx}
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 text-sm text-mykisah-text-secondary hover:text-mykisah-primary p-3 rounded-lg bg-mykisah-bg-tertiary/50 hover:bg-mykisah-bg-tertiary transition-colors"
                                                                    >
                                                                        <i className="ri-file-download-line text-xl"></i>
                                                                        <span>{link.provider}</span>
                                                                        <i className="ri-external-link-line ml-auto"></i>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                // Donghua downloads
                                                downloads[0]?.items.map((item, idx) => (
                                                    <div key={idx} className="mb-4">
                                                        <h5 className="text-sm text-mykisah-tertiary mb-2 font-semibold">{item.quality}</h5>
                                                        <div className="space-y-2">
                                                            {item.links.map((link, linkIdx) => (
                                                                <a
                                                                    key={linkIdx}
                                                                    href={link.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 text-sm text-mykisah-text-secondary hover:text-mykisah-primary p-3 rounded-lg bg-mykisah-bg-tertiary/50 hover:bg-mykisah-bg-tertiary transition-colors"
                                                                >
                                                                    <i className="ri-file-download-line text-xl"></i>
                                                                    <span>{link.provider}</span>
                                                                    <i className="ri-external-link-line ml-auto"></i>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Share */}
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1 px-4 py-2 bg-mykisah-bg-secondary rounded-full border border-mykisah-bg-tertiary text-mykisah-text-secondary hover:text-mykisah-primary transition-colors whitespace-nowrap"
                    >
                        <i className="ri-share-line text-xl"></i>
                        <span className="text-sm">Share</span>
                    </button>

                    {/* Report */}
                    <button
                        onClick={handleReport}
                        className="flex items-center gap-1 px-4 py-2 bg-mykisah-bg-secondary rounded-full border border-mykisah-bg-tertiary text-mykisah-text-secondary hover:text-red-500 transition-colors whitespace-nowrap"
                    >
                        <i className="ri-flag-line text-xl"></i>
                        <span className="text-sm">Report</span>
                    </button>
                </div>

                {/* Episodes List - Horizontal Scroll with Numbers Only */}
                {sortedEpisodes.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-mykisah-tertiary font-semibold">Episodes</h2>
                            <button className="text-sm text-mykisah-primary">View All</button>
                        </div>
                        <div
                            id="episodes-container"
                            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                        >
                            {sortedEpisodes.map((ep, index) => {
                                const epNumber = isAnime
                                    ? extractEpisodeNumber(ep.url)
                                    : ep.number
                                const isCurrent = isAnime
                                    ? ep.url === data.episode?.url
                                    : ep.number === data.episode?.number

                                return (
                                    <div
                                        id={`episode-${index}`}
                                        key={index}
                                        onClick={() => {
                                            // Navigate to episode
                                            const epSlug = isAnime
                                                ? ep.url.match(/\/([^\/]+?)(?:\/?)$/)?.[1]
                                                : ep.url.match(/https:\/\/anichin\.moe\/([^\/]+)/)?.[1]
                                            if (epSlug) {
                                                navigate(`/watch/${type}/${epSlug}`)
                                            }
                                        }}
                                        className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${isCurrent
                                                ? 'bg-mykisah-primary text-black scale-110 font-bold'
                                                : 'bg-mykisah-bg-secondary text-mykisah-text-secondary hover:bg-mykisah-bg-tertiary border border-mykisah-bg-tertiary'
                                            }`}
                                    >
                                        <span className="text-sm font-semibold">
                                            EP{formatNumber(epNumber)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-mykisah-tertiary font-semibold mb-3">Recommendations</h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {recommendations.map((item, idx) => (
                                <RecommendationCard key={idx} item={item} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments Section (Dummy) */}
                <div>
                    <h2 className="text-mykisah-tertiary font-semibold mb-3">Comments</h2>
                    <div className="bg-mykisah-bg-secondary rounded-xl p-4 border border-mykisah-bg-tertiary">
                        <div className="flex gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-mykisah-bg-tertiary flex items-center justify-center">
                                <i className="ri-user-line text-mykisah-text-secondary"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 bg-transparent border-b border-mykisah-bg-tertiary py-1 text-sm focus:outline-none focus:border-mykisah-primary"
                            />
                        </div>

                        {/* Dummy comments */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-mykisah-bg-tertiary flex items-center justify-center">
                                    <i className="ri-user-line text-mykisah-text-secondary"></i>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold">User {i}</span>
                                        <span className="text-xs text-mykisah-text-secondary">2 days ago</span>
                                    </div>
                                    <p className="text-sm text-mykisah-text-secondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <button className="text-xs text-mykisah-text-secondary hover:text-mykisah-primary">Like</button>
                                        <button className="text-xs text-mykisah-text-secondary hover:text-mykisah-primary">Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add animation CSS */}
            <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    )
}