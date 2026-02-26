import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Donghua() {
    const navigate = useNavigate()
    const [donghua, setDonghua] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [pagination, setPagination] = useState({
        current_page: 1,
        has_next_page: false,
        next_page: null,
        last_page: null
    })

    // State untuk filter
    const [filters, setFilters] = useState({
        genre: [],
        season: [],
        studio: [],
        status: '',
        type: '',
        sub: '',
        order: ''
    })

    // Handler untuk klik card
    const handleCardClick = (slug) => {
        navigate(`/detail/donghua/${slug}`)
    }

    // State untuk UI filter dropdown
    const [openDropdown, setOpenDropdown] = useState(null)

    // Data untuk filter
    const filterOptions = {
        genres: [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
            'Martial Arts', 'Romance', 'Sci-fi', 'Cultivation', 'Harem',
            'Historical', 'Isekai', 'Magic', 'Mystery', 'Psychological',
            'Shounen', 'Slice of Life', 'Supernatural', 'Thriller'
        ],
        seasons: [
            'Winter 2026', 'Fall 2025', 'Summer 2025', 'Spring 2025',
            'Winter 2025', 'Fall 2024', 'Summer 2024', 'Spring 2024'
        ],
        studios: [
            'Haoliners Animation League', 'Studio LAN', 'Shenman Entertainment',
            'CG Year', 'Nice Boat Animation', 'Chosen Studio', 'Xmov',
            'Dancing CG Studio', 'B.CMAY PICTURES', 'BigFireBird Animation'
        ],
        statuses: ['ongoing', 'completed', 'upcoming', 'hiatus'],
        types: ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Donghua'],
        subs: ['Sub', 'Dub', 'Raw'],
        orders: [
            { value: 'title', label: 'A-Z' },
            { value: 'titlereverse', label: 'Z-A' },
            { value: 'update', label: 'Latest Update' },
            { value: 'latest', label: 'Latest Added' },
            { value: 'popular', label: 'Popular' },
            { value: 'rating', label: 'Rating' }
        ]
    }

    const API_BASE = 'https://api-samehadaku-how-anichin.vercel.app/api'

    // Fetch data dengan filter
    const fetchDonghua = async (page = 1) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            params.append('page', page)
            params.append('limit', 20)

            if (filters.genre.length > 0) {
                filters.genre.forEach(g => params.append('genre', g))
            }
            if (filters.season.length > 0) {
                filters.season.forEach(s => params.append('season', s))
            }
            if (filters.studio.length > 0) {
                filters.studio.forEach(s => params.append('studio', s))
            }
            if (filters.status) params.append('status', filters.status)
            if (filters.type) params.append('type', filters.type)
            if (filters.sub) params.append('sub', filters.sub)
            if (filters.order) params.append('order', filters.order)

            const response = await axios.get(`${API_BASE}/donghua/list?${params.toString()}`)

            if (response.data.success) {
                setDonghua(response.data.data.donghua)
                setPagination(response.data.pagination)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengambil data')
            console.error('Error fetching donghua:', err)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchDonghua(1)
    }, [])

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        setFilters(prev => {
            if (Array.isArray(prev[filterType])) {
                const newArray = prev[filterType].includes(value)
                    ? prev[filterType].filter(item => item !== value)
                    : [...prev[filterType], value]
                return { ...prev, [filterType]: newArray }
            } else {
                return { ...prev, [filterType]: value === prev[filterType] ? '' : value }
            }
        })
    }

    // Apply filter
    const applyFilters = () => {
        fetchDonghua(1)
        setShowFilters(false)
        setOpenDropdown(null)
    }

    // Reset filter
    const resetFilters = () => {
        setFilters({
            genre: [],
            season: [],
            studio: [],
            status: '',
            type: '',
            sub: '',
            order: ''
        })
        setOpenDropdown(null)
    }

    // Handle pagination
    const handlePageChange = (newPage) => {
        fetchDonghua(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Toggle dropdown
    const toggleDropdown = (dropdownName) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
    }

    // Toggle filter section
    const toggleFilters = () => {
        setShowFilters(!showFilters)
        setOpenDropdown(null)
    }

    // Render filter dropdown
    const renderFilterDropdown = (title, filterKey, options, isMulti = false) => {
        const isOpen = openDropdown === filterKey
        const selectedCount = isMulti ? filters[filterKey].length : (filters[filterKey] ? 1 : 0)

        return (
            <div className="relative">
                <button
                    type="button"
                    onClick={() => toggleDropdown(filterKey)}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-2 min-w-[120px] transition-colors ${selectedCount > 0
                            ? 'bg-[#f3a143] text-white'
                            : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                        }`}
                >
                    <span className="flex items-center gap-1">
                        <span>{title}</span>
                        {selectedCount > 0 && (
                            <span className="bg-white text-[#f3a143] px-1.5 py-0.5 rounded-full text-xs font-bold">
                                {selectedCount}
                            </span>
                        )}
                    </span>
                    <i className={`ri-arrow-down-s-line text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {isOpen && (
                    <>
                        {/* Overlay untuk menutup dropdown ketika klik di luar */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenDropdown(null)}
                        />

                        {/* Dropdown menu */}
                        <div className="absolute top-full left-0 mt-1 z-50 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-xl w-64 max-h-96 overflow-y-auto">
                            {isMulti && (
                                <div className="p-2 border-b border-gray-700">
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-600 text-[#f3a143] focus:ring-[#f3a143]"
                                            checked={filters[filterKey].length === 0}
                                            onChange={() => setFilters(prev => ({ ...prev, [filterKey]: [] }))}
                                        />
                                        <span>All</span>
                                    </label>
                                </div>
                            )}

                            {options.map((option, index) => {
                                const value = typeof option === 'object' ? option.value : option
                                const label = typeof option === 'object' ? option.label : option
                                const isChecked = isMulti
                                    ? filters[filterKey].includes(value)
                                    : filters[filterKey] === value

                                return (
                                    <div key={index} className="p-2 hover:bg-[#3a3a3a]">
                                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                                            <input
                                                type={isMulti ? "checkbox" : "radio"}
                                                name={filterKey}
                                                value={value}
                                                checked={isChecked}
                                                onChange={() => handleFilterChange(filterKey, value)}
                                                className={isMulti
                                                    ? "rounded border-gray-600 text-[#f3a143] focus:ring-[#f3a143]"
                                                    : "rounded-full border-gray-600 text-[#f3a143] focus:ring-[#f3a143]"
                                                }
                                            />
                                            <span>{label}</span>
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        )
    }

    // Render card donghua
    const renderDonghuaCard = (item) => (
        <div
            key={item.slug}
            onClick={() => handleCardClick(item.slug)}
            className="group cursor-pointer block"
            >
            <article key={item.slug} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg">
                    {/* Type Badge */}
                    <div className="absolute top-1 right-1 z-10 bg-black/70 text-white px-2 py-1 rounded-md text-[11px]">
                        {item.type}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-1 left-2 right-2 flex justify-between z-10">
                        <span className=" text-white text-[11px]">
                            {item.episode}
                        </span>
                    </div>

                    {/* Image */}
                    <img
                        src={item.thumbnail || 'https://via.placeholder.com/247x350?text=No+Image'}
                        alt={item.title}
                        className="w-full h-auto aspect-[2/3] object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                    {/* Gradient bawah */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/95 to-transparent rounded-b-[6px]" />
                </div>

                {/* Title */}
                <h3 className="mt-1 mb-3 text-mykisah-text-primary text-sm line-clamp-1">
                    {item.title}
                </h3>
            </article>
        </div>
    )

    return (
        <div className="min-h-screen px-2 p-4 pt-1">
            {/* Header dengan Filter Toggle */}
            <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-semibold text-white">
                    Donghua List
                </h1>

                <button
                    onClick={toggleFilters}
                    className="p-1 transition-colors duration-200"
                >
                    <i
                        className={`ri-equalizer-line text-[20px] transition-all duration-300
                ${showFilters
                                ? 'text-[#f3a143]'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    ></i>
                </button>
            </div>

            {/* Filter Section - Collapsible */}
            {showFilters && (
                <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] animate-fadeIn">
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 items-center">
                        {renderFilterDropdown('Genre', 'genre', filterOptions.genres, true)}
                        {renderFilterDropdown('Season', 'season', filterOptions.seasons, true)}
                        {renderFilterDropdown('Studio', 'studio', filterOptions.studios, true)}
                        {renderFilterDropdown('Status', 'status', filterOptions.statuses, false)}
                        {renderFilterDropdown('Type', 'type', filterOptions.types, false)}
                        {renderFilterDropdown('Sub', 'sub', filterOptions.subs, false)}
                        {renderFilterDropdown('Order', 'order', filterOptions.orders, false)}

                        {/* Action Buttons */}
                        <div className="col-span-3 sm:col-span-4 lg:col-span-6 flex justify-end gap-2 mt-1">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 bg-[#3a3a3a] text-gray-300 rounded-lg hover:bg-[#4a4a4a] transition-colors flex items-center gap-2"
                            >
                                <i className="ri-refresh-line"></i>
                                <span className="hidden sm:inline">Reset</span>
                            </button>

                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-mykisah-primary text-white rounded-lg hover:bg-[#e39923] transition-colors flex items-center gap-2"
                            >
                                <i className="ri-search-line"></i>
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f) && (
                        <div className="mt-3 pt-3 border-t border-[#3a3a3a]">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(filters).map(([key, value]) => {
                                    if (Array.isArray(value) && value.length > 0) {
                                        return value.map(v => (
                                            <span key={`${key}-${v}`} className="inline-flex items-center gap-1 px-2 py-1 bg-[#fee0ae] text-[#1a1a1a] rounded-full text-xs">
                                                <span>{key}: {v}</span>
                                                <button
                                                    onClick={() => handleFilterChange(key, v)}
                                                    className="hover:text-[#e39923]"
                                                >
                                                    <i className="ri-close-line"></i>
                                                </button>
                                            </span>
                                        ))
                                    } else if (!Array.isArray(value) && value) {
                                        return (
                                            <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-[#fee0ae] text-[#1a1a1a] rounded-full text-xs">
                                                <span>{key}: {value}</span>
                                                <button
                                                    onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                                                    className="hover:text-[#e39923]"
                                                >
                                                    <i className="ri-close-line"></i>
                                                </button>
                                            </span>
                                        )
                                    }
                                    return null
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-white">
                    <i className="ri-loader-4-line text-5xl animate-spin text-[#f3a143]"></i>
                    <p className="mt-4 text-gray-400">Loading donghua list...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-20 bg-[#2a2a2a] rounded-lg">
                    <i className="ri-error-warning-line text-5xl text-[#f3a143]"></i>
                    <p className="mt-4 text-white">{error}</p>
                    <button
                        onClick={() => fetchDonghua(1)}
                        className="mt-4 px-4 py-2 bg-[#f3a143] text-white rounded-lg hover:bg-[#e39923] transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Donghua List Grid */}
            {!loading && !error && (
                <>
                    {donghua.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                            {donghua.map(item => renderDonghuaCard(item))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[#2a2a2a] rounded-lg">
                            <i className="ri-inbox-line text-5xl text-gray-500"></i>
                            <p className="mt-4 text-gray-400">Tidak ada donghua yang ditemukan dengan filter tersebut.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.has_next_page && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => handlePageChange(pagination.next_page)}
                                className="px-6 py-3 bg-[#f3a143] text-white rounded-lg hover:bg-[#e39923] transition-colors inline-flex items-center gap-2"
                            >
                                <span>Next Page</span>
                                <i className="ri-arrow-right-s-line"></i>
                            </button>
                            <p className="mt-2 text-sm text-gray-500">
                                Page {pagination.current_page}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Tambahkan style untuk animasi */}
            <style jsx>{`
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
            `}</style>
        </div>
    )
}