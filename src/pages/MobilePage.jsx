import React, { useState, useEffect } from 'react';
import Navbar from '../components/home/mobile/Navbar';
import TabNavigation from '../components/home/mobile/TabNavigation';
import ContentGrid from '../components/home/mobile/ContentGrid';
import ScrollToTop from '../components/home/mobile/ScrollToTop';
import DonateSection from '../components/home/mobile/DonateSection';
import ContinueWatching from '../components/home/mobile/ContinueWatching';
import Top10Anime from '../components/home/mobile/Top10Anime';

export default function MobilePage() {
    const [activeTab, setActiveTab] = useState('anime');
    const [animeData, setAnimeData] = useState([]);
    const [donghuaData, setDonghuaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animePage, setAnimePage] = useState(1);
    const [donghuaPage, setDonghuaPage] = useState(1);
    const [hasMoreAnime, setHasMoreAnime] = useState(true);
    const [hasMoreDonghua, setHasMoreDonghua] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch anime
            const animeRes = await fetch('https://api-samehadaku-how-anichin.vercel.app/api/anime/latest');
            const animeJson = await animeRes.json();
            setAnimeData(animeJson.data || []);

            // Fetch donghua
            const donghuaRes = await fetch('https://api-samehadaku-how-anichin.vercel.app/api/donghua/latest');
            const donghuaJson = await donghuaRes.json();
            setDonghuaData(donghuaJson.data || []);
            setHasMoreDonghua(donghuaJson.has_next || false);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreAnime = async () => {
        try {
            const nextPage = animePage + 1;
            const res = await fetch(`https://api-samehadaku-how-anichin.vercel.app/api/anime/latest?page=${nextPage}`);
            const json = await res.json();
            if (json.data && json.data.length > 0) {
                setAnimeData(prev => [...prev, ...json.data]);
                setAnimePage(nextPage);
                setHasMoreAnime(json.has_next || false);
            } else {
                setHasMoreAnime(false);
            }
        } catch (error) {
            console.error('Error loading more anime:', error);
        }
    };

    const loadMoreDonghua = async () => {
        try {
            const nextPage = donghuaPage + 1;
            const res = await fetch(`https://api-samehadaku-how-anichin.vercel.app/api/donghua/latest?page=${nextPage}`);
            const json = await res.json();
            if (json.data && json.data.length > 0) {
                setDonghuaData(prev => [...prev, ...json.data]);
                setDonghuaPage(nextPage);
                setHasMoreDonghua(json.has_next || false);
            } else {
                setHasMoreDonghua(false);
            }
        } catch (error) {
            console.error('Error loading more donghua:', error);
        }
    };

    return (
        <div className="min-h-screen bg-mykisah-bg-primary text-mykisah-text-primary pb-20">
            <Navbar />
            <DonateSection/>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <ContinueWatching/>
            <ContentGrid
                activeTab={activeTab}
                animeData={animeData}
                donghuaData={donghuaData}
                hasMoreAnime={hasMoreAnime}
                hasMoreDonghua={hasMoreDonghua}
                onLoadMoreAnime={loadMoreAnime}
                onLoadMoreDonghua={loadMoreDonghua}
            />
            <Top10Anime/>
            <ScrollToTop />
        </div>
    );
}