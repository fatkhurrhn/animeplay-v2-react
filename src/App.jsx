// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AutoToTop from './components/AutoToTop';
import Search from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import DetailPage from './pages/DetailPage';

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