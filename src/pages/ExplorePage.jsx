import React, { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'

// Import halaman-halaman tab
import Explore from './explorer/Explore'
import Anime from './explorer/Anime'
import Donghua from './explorer/Donghua'
import Jadwal from './explorer/Jadwal'
import Genre from './explorer/Genre'
import Top10 from './explorer/Top10Anime'
import PopularToday from './explorer/PopularToday'

export default function ExplorePage() {
  const navigate = useNavigate()
  const { tab } = useParams()
  const location = useLocation()
  const tabContainerRef = useRef(null)
  const activeTabRef = useRef(null)

  const tabs = [
    { id: 'explore', label: 'Explore', component: Explore },
    { id: 'anime', label: 'Anime', component: Anime },
    { id: 'donghua', label: 'Donghua', component: Donghua },
    { id: 'jadwal', label: 'Jadwal', component: Jadwal },
    { id: 'genre', label: 'Genre', component: Genre },
    { id: 'top-10', label: 'Top 10 Anime', component: Top10 },
    { id: 'popular-today', label: 'Popular Today', component: PopularToday },
  ]

  // Menentukan tab aktif berdasarkan state atau parameter
  const getActiveTab = () => {
    // Cek apakah ada state selectedTab dari navigasi
    if (location.state?.selectedTab) {
      return location.state.selectedTab
    }

    // Jika tidak ada state, default ke explore
    return 'explore'
  }

  const activeTab = getActiveTab()

  // Efek untuk scroll tab aktif ke tengah di mobile
  useEffect(() => {
    if (window.innerWidth < 640 && activeTabRef.current && tabContainerRef.current) {
      const container = tabContainerRef.current
      const activeTabElement = activeTabRef.current

      const containerWidth = container.offsetWidth
      const activeTabLeft = activeTabElement.offsetLeft
      const activeTabWidth = activeTabElement.offsetWidth

      // Scroll ke posisi tengah
      const scrollPosition = activeTabLeft - (containerWidth / 2) + (activeTabWidth / 2)

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })
    }
  }, [activeTab])

  // Efek untuk menangani parameter URL
  useEffect(() => {
    // Jika ada tab di URL, pindahkan ke state dan redirect
    if (tab) {
      const validTabs = tabs.map(t => t.id)
      if (validTabs.includes(tab)) {
        // Tab valid, pindahkan ke state
        navigate('/explore', {
          replace: true,
          state: { selectedTab: tab }
        })
      } else {
        // Tab tidak valid, redirect ke explore
        navigate('/explore', { replace: true })
      }
    }
  }, [tab, navigate])

  const handleTabChange = (tabId) => {
    // Navigasi ke explore dengan state tab yang dipilih
    navigate('/explore', {
      state: { selectedTab: tabId },
      replace: true
    })
  }

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || Explore

  return (
    <div className="min-h-screen bg-dark-bg overflow-x-hidden">
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <nav className="bg-[#0a0a0a] px-4 py-2 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="ri-vip-crown-line text-2xl text-mykisah-primary"></i>
            </div>

            <div className="flex items-center">
              <span className="text-[23px] font-semibold tracking-tight">
                <span className="text-white">Explore</span>
              </span>
            </div>

            <Link to="/search" className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all">
              <i className="ri-search-line text-xl text-mykisah-primary"></i>
            </Link>
          </div>
        </nav>

        {/* Fixed Tab Navigation */}
        <div className="bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border w-full">
          <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
            {/* Desktop view - full width tabs */}
            <div className="hidden sm:flex gap-1 p-1 bg-dark-bg-tertiary/30 rounded-2xl w-full">
              {tabs.map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => handleTabChange(tabItem.id)}
                  className={`
                    flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap
                    ${activeTab === tabItem.id
                      ? 'bg-[#ffaf2f] text-black shadow-lg'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-dark-bg-tertiary/50'
                    }
                  `}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* Mobile view - scrollable tabs dengan center active */}
            <div className="sm:hidden w-full overflow-x-auto hide-scrollbar" ref={tabContainerRef}>
              <div className="flex gap-1 p-1 bg-dark-bg-tertiary/30 rounded-2xl min-w-max">
                {tabs.map((tabItem) => (
                  <button
                    key={tabItem.id}
                    ref={activeTab === tabItem.id ? activeTabRef : null}
                    onClick={() => handleTabChange(tabItem.id)}
                    className={`
                      px-6 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap
                      ${activeTab === tabItem.id
                        ? 'bg-[#ffaf2f] text-black shadow-lg scale-105'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-dark-bg-tertiary/50'
                      }
                    `}
                  >
                    {tabItem.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer untuk fixed navbar dan tabs */}
      <div className="h-[112px] sm:h-[120px]"></div>

      {/* Konten Tab - dengan padding yang konsisten */}
      <div className="w-full px-2 sm:px-4 py-0 sm:py-6 pb-10 mt-2">
        <div className="w-full max-w-full overflow-x-hidden">
          <ActiveComponent />
        </div>
      </div>

      {/* CSS sebagai style tag biasa, bukan jsx */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Memastikan semua elemen tidak overflow */
        .w-full {
          width: 100%;
          max-width: 100vw;
          box-sizing: border-box;
        }
        
        /* Memperbaiki padding dan margin untuk mobile */
        @media (max-width: 640px) {
          .px-2 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
        }

        /* Animasi untuk tab aktif */
        button {
          transition: all 0.2s ease;
        }
        
        .scale-105 {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}