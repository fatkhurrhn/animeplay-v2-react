import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Anime() {
    const [animeList, setAnimeList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        current_page: 1,
        has_next_page: false,
        last_page: 1
    })

    // State untuk filter
    const [filters, setFilters] = useState({
        title: '',
        genre: [],
        status: '',
        type: '',
        order: ''
    })

    const [showFilters, setShowFilters] = useState(false)

    // Options untuk dropdown
    const statusOptions = ['', 'Ongoing', 'Completed']
    const typeOptions = ['', 'TV', 'OVA', 'ONA', 'Special', 'Movie']
    const orderOptions = [
        { value: '', label: 'Default' },
        { value: 'title', label: 'Title A-Z' },
        { value: 'titlereverse', label: 'Title Z-A' },
        { value: 'update', label: 'Terbaru' },
        { value: 'latest', label: 'Latest Update' },
        { value: 'popular', label: 'Populer' }
    ]

    const genreOptions = [
        'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Game',
        'Harem', 'Isekai', 'Mecha', 'Military', 'Mystery', 'Romance',
        'School', 'Sci-Fi', 'Shoujo', 'Shounen', 'Slice of Life', 'Sports'
    ]

    const fetchAnimeList = async (page = 1) => {
        setLoading(true)
        setError(null)

        try {
            // Bangun URL dengan filter
            let url = `https://api-samehadaku-how-anichin.vercel.app/api/anime/list?page=${page}&limit=20`

            if (filters.title) {
                url += `&title=${encodeURIComponent(filters.title)}`
            }

            if (filters.genre.length > 0) {
                filters.genre.forEach(genre => {
                    url += `&genre=${encodeURIComponent(genre)}`
                })
            }

            if (filters.status) {
                url += `&status=${encodeURIComponent(filters.status)}`
            }

            if (filters.type) {
                url += `&type=${encodeURIComponent(filters.type)}`
            }

            if (filters.order) {
                url += `&order=${encodeURIComponent(filters.order)}`
            }

            const response = await fetch(url)
            const result = await response.json()

            if (result.success) {
                setAnimeList(result.data.anime)
                setPagination({
                    current_page: result.pagination.current_page,
                    has_next_page: result.pagination.has_next_page,
                    last_page: result.pagination.last_page || result.pagination.current_page
                })
            } else {
                setError('Gagal mengambil data anime')
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mengambil data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnimeList(1)
    }, [])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleGenreToggle = (genre) => {
        setFilters(prev => {
            const newGenres = prev.genre.includes(genre)
                ? prev.genre.filter(g => g !== genre)
                : [...prev.genre, genre]
            return {
                ...prev,
                genre: newGenres
            }
        })
    }

    const applyFilters = () => {
        fetchAnimeList(1)
        setShowFilters(false)
    }

    const resetFilters = () => {
        setFilters({
            title: '',
            genre: [],
            status: '',
            type: '',
            order: ''
        })
        setTimeout(() => {
            fetchAnimeList(1)
        }, 100)
    }

    const loadMore = () => {
        if (pagination.has_next_page) {
            fetchAnimeList(pagination.current_page + 1)
        }
    }

    // Helper untuk menampilkan rating bintang
    const renderStars = (score) => {
        const rating = score / 2 // Konversi ke skala 1-5
        const fullStars = Math.floor(rating)
        const halfStar = rating % 1 >= 0.5 ? 1 : 0
        const emptyStars = 5 - fullStars - halfStar

        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <i key={`full-${i}`} className="ri-star-fill text-[#ffaf2f] text-xs"></i>
                ))}
                {halfStar === 1 && (
                    <i className="ri-star-half-fill text-[#ffaf2f] text-xs"></i>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <i key={`empty-${i}`} className="ri-star-line text-[#ffaf2f] text-xs"></i>
                ))}
                <span className="text-xs text-gray-400 ml-1">{score.toFixed(1)}</span>
            </div>
        )
    }

    return (
        <div className="px-2 py-4 pt-2">
            {/* Header dengan filter toggle */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Anime List</h2>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-dark-bg-tertiary/30 rounded-xl text-gray-300 hover:text-white transition-colors"
                >
                    <i className="ri-filter-3-line text-lg"></i>
                    <span className="text-sm">Filter</span>
                </button>
            </div>

            {/* Panel Filter */}
            {showFilters && (
                <div className="mb-6 p-4 bg-[#2a2a2a] rounded-2xl border border-dark-border animate-fadeIn">
                    {/* Search by title */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Cari Anime</label>
                        <input
                            type="text"
                            value={filters.title}
                            onChange={(e) => handleFilterChange('title', e.target.value)}
                            placeholder="Masukkan judul anime..."
                            className="w-full px-4 py-2 bg-[#2a2a2a] border border-mykisah-primary rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ffaf2f]/50"
                        />
                    </div>

                    {/* Genre filter */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Genre</label>
                        <div className="flex flex-wrap gap-2">
                            {genreOptions.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => handleGenreToggle(genre)}
                                    className={`px-3 py-1 text-xs rounded-full transition-all ${filters.genre.includes(genre)
                                            ? 'bg-[#ffaf2f] text-black font-medium'
                                            : 'bg-dark-bg-tertiary/50 text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status dan Type filter */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a2a2a] border border-mykisah-primary rounded-xl text-white focus:outline-none focus:border-[#ffaf2f]/50"
                            >
                                <option value="">Semua</option>
                                {statusOptions.filter(s => s !== '').map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Tipe</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-full px-3 py-2 bg-[#2a2a2a] border border-mykisah-primary rounded-xl text-white focus:outline-none focus:border-[#ffaf2f]/50"
                            >
                                <option value="">Semua</option>
                                {typeOptions.filter(t => t !== '').map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Order by */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Urutkan</label>
                        <select
                            value={filters.order}
                            onChange={(e) => handleFilterChange('order', e.target.value)}
                            className="w-full px-3 py-2 bg-[#2a2a2a] border border-mykisah-primary rounded-xl text-white focus:outline-none focus:border-[#ffaf2f]/50"
                        >
                            {orderOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={applyFilters}
                            className="flex-1 py-2 bg-[#ffaf2f] text-[#2a2a2a] font-medium rounded-xl hover:bg-[#ffaf2f]/90 transition-colors"
                        >
                            Terapkan Filter
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-dark-bg-tertiary/50 text-gray-300 border border-mykisah-primary rounded-xl hover:bg-dark-bg-tertiary transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading && animeList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#ffaf2f] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Memuat daftar anime...</p>
                </div>
            )}

            {/* Error state */}
            {error && animeList.length === 0 && (
                <div className="text-center py-12">
                    <i className="ri-error-warning-line text-5xl text-red-500 mb-4"></i>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => fetchAnimeList(1)}
                        className="px-4 py-2 bg-[#ffaf2f] text-black rounded-xl hover:bg-[#ffaf2f]/90"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Grid 3 kolom untuk anime */}
            {!loading && animeList.length > 0 && (
                <>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {animeList.map((anime) => (
                            <Link
                                key={anime.slug}
                                to={`/detail/anime/${anime.slug}`}
                                className="group block bg-dark-bg-tertiary/20 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-200"
                            >
                                <div className="relative aspect-[2/3] overflow-hidden">
                                    <img
                                        src={anime.thumbnail || 'https://via.placeholder.com/200x300?text=No+Image'}
                                        alt={anime.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'
                                        }}
                                    />
                                    {/* Badge type & status */}
                                    <div className="absolute top-1 left-1 flex flex-col gap-1">
                                        <span className="px-1.5 py-0.5 bg-black/70 text-[10px] font-medium text-white rounded backdrop-blur-sm">
                                            {anime.type}
                                        </span>
                                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded backdrop-blur-sm ${anime.status === 'Ongoing'
                                                ? 'bg-green-500/70 text-white'
                                                : 'bg-gray-500/70 text-white'
                                            }`}>
                                            {anime.status === 'Ongoing' ? 'On Going' : anime.status}
                                        </span>
                                    </div>
                                    {/* Score badge */}
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-[#ffaf2f] font-medium backdrop-blur-sm">
                                        <i className="ri-star-fill text-[8px] mr-0.5"></i>
                                        {anime.score.toFixed(1)}
                                    </div>
                                </div>

                                <div className="p-2">
                                    <h3 className="text-xs font-medium text-white line-clamp-2 mb-1 group-hover:text-[#ffaf2f] transition-colors">
                                        {anime.title}
                                    </h3>

                                    {/* Views count */}
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <i className="ri-eye-line"></i>
                                        <span>{anime.views?.replace(' Views', '') || '0'}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Load more button */}
                    {pagination.has_next_page && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="px-6 py-2 bg-dark-bg-tertiary/30 text-gray-300 rounded-xl hover:bg-dark-bg-tertiary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
                            </button>
                        </div>
                    )}

                    {/* Info jumlah anime */}
                    <div className="text-center mt-4 text-xs text-gray-500">
                        Menampilkan {animeList.length} anime
                    </div>
                </>
            )}

            {/* Empty state */}
            {!loading && !error && animeList.length === 0 && (
                <div className="text-center py-12">
                    <i className="ri-emotion-sad-line text-5xl text-gray-500 mb-4"></i>
                    <p className="text-gray-400">Tidak ada anime yang ditemukan</p>
                    <button
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 bg-[#ffaf2f] text-black rounded-xl"
                    >
                        Reset Filter
                    </button>
                </div>
            )}

            {/* Animasi CSS */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    )
}