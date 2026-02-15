// pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Play,
  Clock,
  ChevronRight,
  Flame,
  Tv,
  Sparkles,
  Sword,
  Heart,
  Zap
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://anime-api-iota-beryl.vercel.app/api';

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [latestData, setLatestData] = useState([]);
  const [randomAnime, setRandomAnime] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const scrollRef = useRef(null);

  // Categories
  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'anime', label: 'Anime Latest', icon: Tv },
    { id: 'donghua', label: 'Donghua Latest', icon: Flame },
    { id: 'isekai', label: 'Isekai', icon: Zap },
    { id: 'romance', label: 'Romance', icon: Heart },
    { id: 'action', label: 'Action', icon: Sword },
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch latest combined
        const latestRes = await axios.get(`${API_BASE}/latest`);
        const data = latestRes.data.data || [];
        setLatestData(data);

        // Set random anime for hero (shuffle and take 5)
        const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 5);
        setRandomAnime(shuffled);

        // Mock watch history (in real app, get from localStorage)
        setWatchHistory([
          { id: 1, title: 'Solo Leveling', episode: 'EP 12', progress: 75, image: 'https://via.placeholder.com/300x170/1a1a1a/ffaf2f?text=Solo+Leveling' },
          { id: 2, title: 'Frieren', episode: 'EP 8', progress: 30, image: 'https://via.placeholder.com/300x170/1a1a1a/fed086?text=Frieren' },
          { id: 3, title: 'Jujutsu Kaisen', episode: 'EP 23', progress: 90, image: 'https://via.placeholder.com/300x170/1a1a1a/fee0ae?text=JJK' },
        ]);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scroll handler for header
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter data by category
  const filteredData = () => {
    if (activeCategory === 'all') return latestData;
    if (activeCategory === 'anime') return latestData.filter(item => item.category === 'anime' || item.source === 'samehadaku');
    if (activeCategory === 'donghua') return latestData.filter(item => item.category === 'donghua' || item.source === 'anichin');
    // For genre filters, we'd need to fetch by genre or filter by genre data if available
    return latestData.filter(item =>
      item.title?.toLowerCase().includes(activeCategory) ||
      item.genre?.toLowerCase().includes(activeCategory)
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerScrolled ? 'glass shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-200 to-primary-400 rounded-lg flex items-center justify-center">
              <Play size={18} className="text-black fill-black ml-0.5" />
            </div>
            <span className="text-lg font-bold gradient-text">AnimePlay</span>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Search size={20} className="text-gray-300" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
              <Bell size={20} className="text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-400 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 p-0.5">
              <img
                src="https://via.placeholder.com/32x32/1a1a1a/ffffff?text=U"
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-dark-card"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="pt-14">
        {/* Hero Section - Random Anime Slider */}
        {!loading && randomAnime.length > 0 && (
          <section className="relative w-full overflow-hidden">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-4 py-4"
            >
              {randomAnime.map((anime, index) => (
                <div
                  key={index}
                  className="snap-center shrink-0 w-[85vw] max-w-md relative rounded-2xl overflow-hidden card-hover"
                >
                  {/* Background Image */}
                  <div className="aspect-[16/9] relative">
                    <img
                      src={anime.image || `https://via.placeholder.com/600x340/1a1a1a/ffaf2f?text=${encodeURIComponent(anime.title)}`}
                      alt={anime.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-0.5 bg-primary-400 text-black text-xs font-bold rounded">
                          {anime.type || 'TV'}
                        </span>
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-xs rounded">
                          {anime.source === 'samehadaku' ? 'Anime' : 'Donghua'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                        {anime.title}
                      </h3>
                      <p className="text-xs text-gray-300 line-clamp-2 mb-3">
                        {anime.episode ? `Episode ${anime.episode}` : 'Latest Episode'}
                      </p>
                      <button className="flex items-center space-x-2 bg-primary-400 hover:bg-primary-300 text-black px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
                        <Play size={16} fill="currentColor" />
                        <span>Watch Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-1.5 mt-2">
              {randomAnime.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === 0 ? 'w-4 bg-primary-400' : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Continue Watching */}
        {watchHistory.length > 0 && (
          <section className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                <Clock size={18} className="text-primary-400" />
                <span>Continue Watching</span>
              </h2>
              <button className="text-xs text-primary-400 flex items-center space-x-1">
                <span>See All</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex overflow-x-auto hide-scrollbar gap-3 -mx-4 px-4">
              {watchHistory.map((item) => (
                <div key={item.id} className="shrink-0 w-40 group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={32} className="text-white fill-white" />
                    </div>
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                      <div
                        className="h-full bg-primary-400"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.episode}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category Tabs */}
        <section className="mt-6 sticky top-14 z-30 bg-dark-bg/95 backdrop-blur-sm py-2">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${isActive
                      ? 'bg-primary-400 text-black shadow-lg shadow-primary-400/25'
                      : 'bg-dark-surface text-gray-400 hover:bg-dark-card hover:text-white border border-dark-border'
                    }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Latest Content Grid */}
        <section className="px-4 mt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Latest Releases</h2>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Updated</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] rounded-xl skeleton" />
                  <div className="h-4 w-3/4 rounded skeleton" />
                  <div className="h-3 w-1/2 rounded skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredData().map((item, index) => (
                <div
                  key={index}
                  className="group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-dark-card">
                    <img
                      src={item.image || `https://via.placeholder.com/300x400/1a1a1a/ffaf2f?text=${encodeURIComponent(item.title?.slice(0, 10))}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                      <button className="w-full bg-primary-400 text-black py-2 rounded-lg font-semibold text-sm flex items-center justify-center space-x-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Play size={16} fill="currentColor" />
                        <span>Watch</span>
                      </button>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.source === 'samehadaku' || item.category === 'anime'
                          ? 'bg-blue-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                        }`}>
                        {item.source === 'samehadaku' || item.category === 'anime' ? 'ANIME' : 'DONGHUA'}
                      </span>
                    </div>

                    {/* Episode Badge */}
                    {item.episode && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-black/80 text-primary-300 text-[10px] font-bold rounded border border-primary-400/30">
                          EP {item.episode}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.info || item.type || 'TV Series'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredData().length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No content found for this category</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;