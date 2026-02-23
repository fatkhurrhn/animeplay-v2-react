// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AutoToTop from './components/AutoToTop';
import Search from './pages/SearchPage';
import DetailAnime from './pages/DetailPage/DetailAnime';
import DetailPage from './pages/DetailPage';
import WatchPage from './pages/WatchPage';
import StreamingAnime from './pages/streaming/StreamingAnime';

function App() {
  return (
    <>
      <AutoToTop />
      <Routes>
        {/* Routes without bottom navigation (full screen) - LETAKKAN DI ATAS */}
        <Route path="/detail-anime" element={<DetailAnime />} />
        <Route path="/streaming/anime" element={< StreamingAnime />} />

        <Route path="/detail/:type/:slug" element={<DetailPage />} />
        {/* Fallback route if type is not specified */}
        <Route path="/detail/:slug" element={<DetailPage />} />

        {/* Watch page routes */}
        <Route path="/watch/:type/:episodeSlug" element={<WatchPage />} />
        <Route path="/watch/:episodeSlug" element={<WatchPage />} />

        {/* Routes with bottom navigation */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/explore" element={<ExplorerPage />} />
          <Route path="/mylist" element={<MyListPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} /> */}
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;