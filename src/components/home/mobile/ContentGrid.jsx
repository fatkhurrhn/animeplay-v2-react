import React from 'react';
import { Link } from 'react-router-dom';

// Anime Card Component (internal)
const AnimeCard = ({ item, index }) => {
    const extractSlug = (url) => {
        const matches = url.match(/\/(?:anime|donghua)\/([^\/]+)/);
        return matches ? matches[1] : '';
    };

    const slug = extractSlug(item.url);

    return (
        <Link to={`/detail/anime/${slug}`}>
            <div className="overflow-hidden">

                {/* Thumbnail */}
                <div className="relative">
                    <img
                        src={item?.image}
                        alt={item?.title}
                        className="w-full h-48 object-cover rounded-xl"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                        }}
                    />

                    {/* NEW Label (5 data terbaru - index 0-4) */}
                    {index < 5 && (
                        <div className="absolute -top-0.5 -left-0.5">
                            <div className="relative">
                                {/* Background ribbon */}
                                <div className="bg-mykisah-primary text-black text-[10px] px-3 py-1 
                rounded-br-lg rounded-tl-md shadow-lg">
                                    NEW
                                </div>
                                {/* Efek lipatan */}
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-mykisah-primary/60 
                translate-x-full rounded-bl-sm"
                                    style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 100%)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Gradient bawah */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent rounded-b-xl" />

                    {/* Episode Text */}
                    <div className="absolute bottom-1 left-2 text-xs text-white">
                        Eps {item?.episode}
                    </div>
                </div>

                {/* Title */}
                <div className="pt-1 pb-2">
                    <h3 className="text-mykisah-text-primary text-sm line-clamp-1">
                        {item?.title}
                    </h3>
                </div>

            </div>
        </Link>
    );
};

// Donghua Card Component (internal)
const DonghuaCard = ({ item, index }) => {  // ✅ Tambah prop index
    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Kemarin';
        return `${diffDays} hari ago`;
    };

    const extractDonghuaSlug = (url) => {
        if (typeof url === 'string') {
            const matches = url.match(/https:\/\/anichin\.moe\/([^\/]+)/);
            return matches ? matches[1] : '';
        }
        return '';
    };

    let slug = '';
    if (item.series?.url) {
        slug = extractDonghuaSlug(item.series.url);
    } else if (item.url) {
        slug = extractDonghuaSlug(item.url);
    }

    return (
        <Link to={`/detail/donghua/${slug}`}>
            <div className="overflow-hidden">

                {/* Thumbnail */}
                <div className="relative">
                    <img
                        src={item.image}
                        alt={item.series?.title}
                        className="w-full h-48 object-cover rounded-xl"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                        }}
                    />

                    {/* NEW Label (5 data terbaru - index 0-4) */}
                    {index < 5 && (
                        <div className="absolute -top-0.5 -left-0.5">
                            <div className="relative">
                                {/* Background ribbon */}
                                <div className="bg-mykisah-primary text-black text-[10px] px-3 py-1 
                rounded-br-lg rounded-tl-md shadow-lg">
                                    NEW
                                </div>
                                {/* Efek lipatan */}
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-mykisah-primary/60 
                translate-x-full rounded-bl-sm"
                                    style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 100%)' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Gradient bawah */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent rounded-b-xl" />

                    {/* Episode text */}
                    <div className="absolute bottom-1 left-2 text-xs text-white">
                        {item.episode?.full_episode || `EP ${item.episode?.number}`}
                    </div>
                </div>

                {/* Title */}
                <div className="pt-1 pb-2">
                    <h3 className="text-mykisah-text-primary text-sm line-clamp-1">
                        {item.series?.title}
                    </h3>
                </div>

            </div>
        </Link>
    );
};

// Main ContentGrid Component
export default function ContentGrid({
    activeTab,
    animeData,
    donghuaData,
    hasMoreAnime,
    hasMoreDonghua,
    onLoadMoreAnime,
    onLoadMoreDonghua
}) {
    // Logika untuk membatasi jumlah data yang tampil menjadi 9 item
    const displayedAnimeData = animeData.slice(0, 9);
    const displayedDonghuaData = donghuaData.slice(0, 9);

    // Hitung total data yang sebenarnya (untuk keperluan validasi)
    const totalAnimeData = animeData.length;
    const totalDonghuaData = donghuaData.length;

    return (
        <div className="px-4 py-4">
            {activeTab === 'anime' ? (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Episode Terbaru</h2>
                        <span className="text-xs text-mykisah-text-secondary">
                            {displayedAnimeData.length} dari {totalAnimeData} titles
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {displayedAnimeData.map((item, index) => (
                            <AnimeCard
                                key={`anime-${index}`}
                                item={item}
                                index={index}  // ✅ Tambah prop index
                            />
                        ))}
                    </div>
                    {/* {hasMoreAnime && totalAnimeData > 9 && (
                        <button
                            onClick={onLoadMoreAnime}
                            className="w-full mt-6 py-3 bg-mykisah-bg-secondary text-mykisah-primary rounded-lg font-semibold hover:bg-mykisah-bg-tertiary transition-colors border border-mykisah-bg-tertiary"
                        >
                            Load More Anime
                        </button>
                    )} */}
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Episode Terbaru</h2>
                        <span className="text-xs text-mykisah-text-secondary">
                            {displayedDonghuaData.length} dari {totalDonghuaData} titles
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {displayedDonghuaData.map((item, index) => (
                            <DonghuaCard
                                key={`donghua-${index}`}
                                item={item}
                                index={index}  // ✅ Tambah prop index
                            />
                        ))}
                    </div>
                    {/* {hasMoreDonghua && totalDonghuaData > 9 && (
                        <button
                            onClick={onLoadMoreDonghua}
                            className="w-full mt-6 py-3 bg-mykisah-bg-secondary text-mykisah-primary rounded-lg font-semibold hover:bg-mykisah-bg-tertiary transition-colors border border-mykisah-bg-tertiary"
                        >
                            Load More Donghua
                        </button>
                    )} */}
                </div>
            )}
        </div>
    );
}