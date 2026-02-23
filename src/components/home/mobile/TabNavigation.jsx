import React from 'react';

export default function TabNavigation({ activeTab, onTabChange }) {
    return (
        <div className="flex gap-4">
            <button
                onClick={() => onTabChange('anime')}
                className="relative py-2 text-base font-medium transition-colors"
                style={{
                    color: activeTab === 'anime' ? '#ffaf2f' : '#ffffff'
                }}
            >
                Anime
                {activeTab === 'anime' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#ffaf2f' }}></div>
                )}
            </button>
            <button
                onClick={() => onTabChange('donghua')}
                className="relative py-2 text-base font-medium transition-colors"
                style={{
                    color: activeTab === 'donghua' ? '#ffaf2f' : '#ffffff'
                }}
            >
                Donghua
                {activeTab === 'donghua' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#ffaf2f' }}></div>
                )}
            </button>
        </div>
    );
}