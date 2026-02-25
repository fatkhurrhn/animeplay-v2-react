import React, { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/explorer/Header'

// Import halaman-halaman tab
import Explore from './explorer/Explore'
import Anime from './explorer/Anime'
import Donghua from './explorer/Donghua'
import Jadwal from './explorer/Jadwal'
import Genre from './explorer/Genre'

export default function ExplorePage() {
  const navigate = useNavigate()
  const { tab } = useParams()
  const location = useLocation()

  const tabs = [
    { id: 'explore', label: 'Explore', component: Explore },
    { id: 'anime', label: 'Anime', component: Anime },
    { id: 'donghua', label: 'Donghua', component: Donghua },
    { id: 'jadwal', label: 'Jadwal', component: Jadwal },
    { id: 'genre', label: 'Genre', component: Genre },
  ]

  // Menentukan tab aktif berdasarkan parameter tab dari URL
  const getActiveTab = () => {
    // Jika di path /explore (tanpa parameter), maka tab = 'explore'
    // Jika di path /explore/anime, maka tab = 'anime'
    const validTabs = tabs.map(t => t.id)
    const currentTab = tab || 'explore'

    // Validasi apakah tab valid, jika tidak kembali ke explore
    return validTabs.includes(currentTab) ? currentTab : 'explore'
  }

  const activeTab = getActiveTab()

  useEffect(() => {
    // Validasi tab, jika tidak valid redirect ke explore
    const validTabs = tabs.map(t => t.id)
    if (tab && !validTabs.includes(tab)) {
      navigate('/explore', { replace: true })
    }
  }, [tab, navigate])

  const handleTabChange = (tabId) => {
    if (tabId === 'explore') {
      navigate('/explore')
    } else {
      navigate(`/explore/${tabId}`)
    }
  }

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || Explore

  return (
    <>
      <Header />

      {/* Tab Navigation */}
      <div className="sticky top-[56px] z-40 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border">
        <div className="px-4 py-3">
          <div className="flex gap-1 p-1 bg-dark-bg-tertiary/30 rounded-2xl">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.id}
                onClick={() => handleTabChange(tabItem.id)}
                className={`
                  flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
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
        </div>
      </div>

      {/* Konten Tab */}
      <div className="pb-20">
        <ActiveComponent />
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}