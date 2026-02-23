import React from 'react';
import { Link } from 'react-router-dom';

// Komponen untuk item Anime
const AnimeItem = ({ item }) => (
    <Link to={`/detail-anime?url=${encodeURIComponent(item.url)}`} className="space-y-1.5">
        <div className="relative rounded-[7px] overflow-hidden bg-white/5 aspect-[2/3]">
            <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-1.5 right-1.5">
                <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                        backgroundColor: '#ffaf2f',
                        color: '#0a0a0a'
                    }}
                >
                    Ep {item.episode}
                </span>
            </div>
        </div>
        <h3 className="text-xs font-medium line-clamp-2 text-white/90">{item.title}</h3>
        <p className="text-[10px]" style={{ color: '#fed086' }}>{item.released_on}</p>
    </Link>
);

// Komponen untuk item Donghua
const DonghuaItem = ({ item }) => (
    <div className="space-y-1.5">
        <div className="relative rounded-xl overflow-hidden bg-white/5 aspect-[2/3]">
            <img
                src={item.image}
                alt={item.series?.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-1.5 right-1.5 flex gap-1">
                {item.is_hot && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        <i className="ri-fire-line text-[8px]"></i>
                    </span>
                )}
                <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                        backgroundColor: '#ffaf2f',
                        color: '#0a0a0a'
                    }}
                >
                    {item.episode?.full_episode}
                </span>
            </div>
        </div>
        <h3 className="text-xs font-medium line-clamp-2 text-white/90">{item.series?.title}</h3>
        <p className="text-[10px]" style={{ color: '#fed086' }}>
            {item.type}
        </p>
    </div>
);

// Komponen Loading
const LoadingSpinner = () => (
    <div className="flex justify-center py-8">
        <div className="animate-spin rounded-[7px] h-6 w-6 border-2 border-white/20 border-t-white/80"></div>
    </div>
);

export default function EpisodeList({ activeTab, animeData, donghuaData, loading }) {
    const getDetailLink = () => {
        if (activeTab === 'anime') {
            return 'https://example.com/anime-list';
        } else {
            return 'https://example.com/donghua-list';
        }
    };

    const renderItems = () => {
        if (activeTab === 'anime') {
            return animeData.slice(0, 9).map((item, index) => (
                <AnimeItem key={index} item={item} />
            ));
        } else {
            return donghuaData.slice(0, 9).map((item, index) => (
                <DonghuaItem key={index} item={item} />
            ));
        }
    };

    return (
        <section>
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold flex items-center gap-2">
                    <span style={{ color: '#ffffff' }}>Episode Terbaru</span>
                </h2>

                <a
                    href={getDetailLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-1 transition-all hover:gap-2 group"
                    style={{ color: '#ffc05f' }}
                >
                    <span>Semua</span>
                </a>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {renderItems()}
                </div>
            )}
        </section>
    );
}