// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/BottomNav';
import HomePage from './pages/HomePage';
import AutoToTop from './components/AutoToTop';
import Search from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import DetailPage from './pages/DetailPage';
import ExplorePage from './pages/ExplorePage';
import DetailTop10 from './pages/explorer/DetailTop10';
import DetailPopularToday from './pages/explorer/DetailPopularToday';

function App() {
  return (
    <>
      <AutoToTop />
      <Routes>
        {/* Routes without bottom navigation (full screen) - LETAKKAN DI ATAS */}

        <Route path="/detail/:type/:slug" element={<DetailPage />} />

        <Route path="/watch/:type/:slug" element={<WatchPage />} />

        {/* Routes with bottom navigation */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/:tab" element={<ExplorePage />} />



          <Route path="/explore/detail/top-10-anime" element={<DetailTop10 />} />
          <Route path="/explore/detail/popular-today" element={<DetailPopularToday />} />
          
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;