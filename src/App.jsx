// App.jsx
import { useState } from 'react';
import { Home, Compass, Heart, Clock, User } from 'lucide-react';
import HomePage from './pages/HomePage';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'mylist', label: 'My List', icon: Heart },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'explore':
        return <div className="p-4 pt-20 text-center text-gray-400">Explore Page Coming Soon</div>;
      case 'mylist':
        return <div className="p-4 pt-20 text-center text-gray-400">My List Page Coming Soon</div>;
      case 'history':
        return <div className="p-4 pt-20 text-center text-gray-400">History Page Coming Soon</div>;
      case 'profile':
        return <div className="p-4 pt-20 text-center text-gray-400">Profile Page Coming Soon</div>;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {renderContent()}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-dark-border z-50 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-400/10' : ''
                  }`}>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;