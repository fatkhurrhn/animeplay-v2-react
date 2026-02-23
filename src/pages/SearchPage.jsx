import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [searchInput, setSearchInput] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchInputRef = useRef(null);
    const observerRef = useRef();
    const lastItemRef = useRef();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5));
        }
    }, []);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchQuery) => {
            if (searchQuery.trim().length >= 2) {
                performSearch(searchQuery, 1);
            } else if (searchQuery.trim().length === 0) {
                setResults([]);
                setTotalResults(0);
            }
        }, 500),
        []
    );

    // Handle input change with debounce
    useEffect(() => {
        if (searchInput.trim().length >= 2) {
            debouncedSearch(searchInput);
        } else {
            setResults([]);
            setTotalResults(0);
        }

        return () => debouncedSearch.cancel();
    }, [searchInput]);

    // Initial search from URL param
    useEffect(() => {
        if (initialQuery && initialQuery.length >= 2) {
            setSearchInput(initialQuery);
            performSearch(initialQuery, 1);
        }
    }, []);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        if (loadingMore || results.length === 0) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && pagination?.hasNextPage && !loadingMore) {
                loadMoreResults();
            }
        }, { threshold: 0.5 });

        if (lastItemRef.current) {
            observerRef.current.observe(lastItemRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [loadingMore, pagination, results]);

    const saveRecentSearch = (searchQuery) => {
        if (!searchQuery.trim()) return;

        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const performSearch = async (searchQuery, pageNum = 1) => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

        if (pageNum === 1) {
            setLoading(true);
            setResults([]);
            saveRecentSearch(searchQuery);
            setShowSuggestions(false);
        } else {
            setLoadingMore(true);
        }

        try {
            const url = `https://apinimeee.vercel.app/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                if (pageNum === 1) {
                    setResults(data.results);
                    setTotalResults(data.total);
                } else {
                    setResults(prev => [...prev, ...data.results]);
                }
                setPagination(data.pagination);
                setPage(data.page);
                setQuery(searchQuery);
                setSearchParams({ q: searchQuery });
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreResults = () => {
        if (pagination?.hasNextPage && !loadingMore) {
            performSearch(query, page + 1);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        if (value.trim().length === 0) {
            setResults([]);
            setTotalResults(0);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(value.trim().length < 2);
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setResults([]);
        setTotalResults(0);
        setQuery('');
        searchInputRef.current?.focus();
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchInput(suggestion);
        performSearch(suggestion, 1);
    };

    const handleCardClick = (item) => {
        const url = item.url;
        const slug = url.split('/').filter(Boolean).pop();
        const type = item.type?.toLowerCase() === 'donghua' ? 'donghua' : 'anime';

        navigate(`/detail/${type}/${slug}`, {
            state: { title: item.title, type }
        });
    };

    const getTypeIcon = (type) => {
        if (type?.toLowerCase() === 'donghua') {
            return <i className="ri-ancient-pavilion-line text-[#fbc266]"></i>;
        }
        return <i className="ri-movie-line text-[#f5b048]"></i>;
    };

    const SearchCard = ({ item, index }) => {
        const isLastItem = index === results.length - 1;
        const itemType = item.type?.toLowerCase() === 'donghua' ? 'Donghua' : 'Anime';
        const isOngoing = item.status?.toLowerCase() === 'ongoing';

        return (
            <div
                ref={isLastItem ? lastItemRef : null}
                onClick={() => handleCardClick(item)}
                className="bg-[#2a2a2a] rounded-xl overflow-hidden cursor-pointer hover:scale-[0.98] transition-all duration-200 border border-[#333] hover:border-[#f5b048] group"
            >
                <div className="relative pt-[140%]">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/247x350?text=No+Image';
                        }}
                    />

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span className="text-[10px] text-white">{itemType}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium backdrop-blur-sm ${isOngoing
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                            {item.status || 'Completed'}
                        </span>
                    </div>
                </div>

                <div className="p-3">
                    <h3 className="text-sm font-semibold text-[#fee0ae] line-clamp-2 mb-1 min-h-[40px]">
                        {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        {itemType}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-[#333]">
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-[#fbc266] hover:text-[#f5b048] transition-colors"
                        >
                            <i className="ri-arrow-left-line text-2xl"></i>
                        </button>

                        <div className="flex-1 relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchInput}
                                onChange={handleInputChange}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Cari anime atau donghua..."
                                className="w-full bg-[#2a2a2a] border border-[#444] rounded-xl py-3 px-4 pr-20 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#f5b048] transition-colors"
                                autoFocus
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {searchInput && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="text-gray-400 hover:text-[#fbc266] transition-colors"
                                    >
                                        <i className="ri-close-line text-lg"></i>
                                    </button>
                                )}
                                <i className="ri-search-line text-[#fbc266] text-lg"></i>
                            </div>
                        </div>
                    </div>

                    {/* Search Stats */}
                    {query && totalResults > 0 && !loading && (
                        <div className="mt-2 px-2">
                            <p className="text-xs text-gray-400">
                                Menemukan <span className="text-[#fbc266] font-semibold">{totalResults}</span> hasil untuk "{query}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Recent Searches / Suggestions */}
                {showSuggestions && searchInput.length < 2 && recentSearches.length > 0 && (
                    <div className="px-4 pb-3">
                        <p className="text-xs text-[#fee0ae] mb-2">Pencarian Terakhir:</p>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(search)}
                                    className="px-3 py-1.5 bg-[#2a2a2a] rounded-full text-xs text-gray-300 hover:bg-[#333] hover:text-[#fbc266] transition-colors border border-[#444] flex items-center gap-1"
                                >
                                    <i className="ri-history-line text-[10px]"></i>
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Grid */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-[#333] border-t-[#f5b048] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#fbc266]">Mencari...</p>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="grid grid-cols-3 gap-2">
                            {results.map((item, index) => (
                                <SearchCard key={`${item.source}-${index}`} item={item} index={index} />
                            ))}
                        </div>

                        {/* Loading More Indicator */}
                        {loadingMore && (
                            <div className="text-center py-6">
                                <div className="w-8 h-8 border-3 border-[#333] border-t-[#f5b048] rounded-full animate-spin mx-auto"></div>
                            </div>
                        )}
                    </>
                ) : query ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-4 text-[#fbc266] opacity-50">
                            <i className="ri-emotion-sad-line text-6xl"></i>
                        </div>
                        <p className="text-gray-400 mb-2">Tidak ada hasil untuk "{query}"</p>
                        <p className="text-sm text-gray-500">Coba kata kunci lain atau periksa ejaan Anda</p>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-4 text-[#fbc266] opacity-30">
                            <i className="ri-search-line text-6xl"></i>
                        </div>
                        <p className="text-gray-400">Cari anime atau donghua favoritmu</p>
                        <p className="text-xs text-gray-500 mt-2">Minimal 2 karakter</p>
                    </div>
                )}
            </div>

            {/* Scroll to top button - muncul setelah scroll */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 bg-[#f5b048] text-[#1a1a1a] w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-[#e39923] transition-colors duration-300 z-50"
            >
                <i className="ri-arrow-up-line text-xl"></i>
            </button>
        </div>
    );
}