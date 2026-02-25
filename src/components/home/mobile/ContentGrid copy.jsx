import React from 'react';
import { Link } from 'react-router-dom';

// Gabungan Card Component untuk Anime dan Donghua
const ContentCard = ({ item, type }) => {
    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Kemarin';
        return `${diffDays} hari yang lalu`;
    };

    const extractSlug = (url, type) => {
        if (type === 'anime') {
            const matches = url.match(/\/(?:anime|donghua)\/([^\/]+)/);
            return matches ? matches[1] : '';
        } else {
            if (typeof url === 'string') {
                const matches = url.match(/https:\/\/anichin\.moe\/([^\/]+)/);
                return matches ? matches[1] : '';
            }
            return '';
        }
    };

    // Logic untuk mendapatkan slug berdasarkan tipe
    let slug = '';
    if (type === 'anime') {
        slug = extractSlug(item.url, 'anime');
    } else {
        if (item.series?.url) {
            slug = extractSlug(item.series.url, 'donghua');
        } else if (item.url) {
            slug = extractSlug(item.url, 'donghua');
        }
    }

    // Logic untuk mendapatkan title berdasarkan tipe
    const title = type === 'anime' ? item.title : (item.series?.title || item.title);

    // Logic untuk mendapatkan episode display
    const episodeDisplay = type === 'anime'
        ? `EP ${item.episode}`
        : (item.episode?.full_episode || `EP ${item.episode?.number}`);

    // Logic untuk mendapatkan info secondary (tanggal/author/source)
    const secondaryInfo = type === 'anime'
        ? (
            <div className="flex items-center justify-between text-xs">
                <span className="text-mykisah-secondary">{item.released_on}</span>
                <span className="text-mykisah-text-secondary">by {item.posted_by}</span>
            </div>
        )
        : (
            <div className="flex items-center justify-between text-xs">
                <span className="text-mykisah-secondary">{formatRelativeTime(item.scraped_at)}</span>
                <span className="text-mykisah-text-secondary">{item.source}</span>
            </div>
        );

    return (
        <Link to={`/detail/${type}/${slug}`}>
            <div className="bg-mykisah-bg-secondary rounded-xl overflow-hidden shadow-lg border border-mykisah-bg-tertiary hover:border-mykisah-primary transition-all duration-300">
                <div className="relative">
                    <img
                        src={item.image}
                        alt={title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                        }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                        {type === 'donghua' && item.is_hot && (
                            <span className="bg-mykisah-hot text-white text-xs font-bold px-2 py-1 rounded-full">
                                🔥 HOT
                            </span>
                        )}
                        <span className={`${type === 'anime' ? 'bg-mykisah-primary text-black' : 'bg-mykisah-accent text-black'} text-xs font-bold px-2 py-1 rounded-full`}>
                            {episodeDisplay}
                        </span>
                    </div>
                    {(type === 'donghua' && item.episode?.sub_badge) ? (
                        <div className="absolute bottom-2 left-2">
                            <span className="bg-mykisah-sub/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                {item.episode.sub_badge}
                            </span>
                        </div>
                    ) : (
                        <div className="absolute bottom-2 left-2">
                            <span className="bg-black/70 text-mykisah-tertiary text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                {item.type || type === 'anime' ? 'Anime' : 'Donghua'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <h3 className="text-mykisah-text-primary font-semibold text-sm mb-1 line-clamp-2">{title}</h3>
                    {secondaryInfo}
                </div>
            </div>
        </Link>
    );
};

// Main ContentGrid Component dengan ContentCard yang sudah digabung
export default function ContentGrid({
    activeTab,
    animeData,
    donghuaData,
    hasMoreAnime,
    hasMoreDonghua,
    onLoadMoreAnime,
    onLoadMoreDonghua
}) {
    return (
        <div className="px-4 py-4">
            {activeTab === 'anime' ? (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-mykisah-tertiary">Latest Anime</h2>
                        <span className="text-xs text-mykisah-text-secondary">{animeData.length} titles</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {animeData.map((item, index) => (
                            <ContentCard
                                key={`anime-${index}`}
                                item={item}
                                type="anime"
                            />
                        ))}
                    </div>
                    {hasMoreAnime && (
                        <button
                            onClick={onLoadMoreAnime}
                            className="w-full mt-6 py-3 bg-mykisah-bg-secondary text-mykisah-primary rounded-lg font-semibold hover:bg-mykisah-bg-tertiary transition-colors border border-mykisah-bg-tertiary"
                        >
                            Load More Anime
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-mykisah-tertiary">Latest Donghua</h2>
                        <span className="text-xs text-mykisah-text-secondary">{donghuaData.length} titles</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {donghuaData.map((item, index) => (
                            <ContentCard
                                key={`donghua-${index}`}
                                item={item}
                                type="donghua"
                            />
                        ))}
                    </div>
                    {hasMoreDonghua && (
                        <button
                            onClick={onLoadMoreDonghua}
                            className="w-full mt-6 py-3 bg-mykisah-bg-secondary text-mykisah-primary rounded-lg font-semibold hover:bg-mykisah-bg-tertiary transition-colors border border-mykisah-bg-tertiary"
                        >
                            Load More Donghua
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}