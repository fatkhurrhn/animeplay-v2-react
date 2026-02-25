import React from 'react';

export default function TabNavigation({ activeTab, onTabChange }) {
    return (
        <div className="px-4 pt-5 border-mykisah-bg-tertiary">
            <div className="flex gap-6">
                <button
                    onClick={() => onTabChange('anime')}
                    className={`pb-2 font-semibold transition-all duration-300 border-b-2 ${activeTab === 'anime'
                            ? 'border-mykisah-primary text-mykisah-primary'
                            : 'border-transparent hover:text-mykisah-text-primary'
                        }`}
                >
                    Anime
                </button>

                <button
                    onClick={() => onTabChange('donghua')}
                    className={`pb-2 font-semibold transition-all duration-300 border-b-2 ${activeTab === 'donghua'
                            ? 'border-mykisah-primary text-mykisah-primary'
                            : 'border-transparent hover:text-mykisah-text-primary'
                        }`}
                >
                    Donghua
                </button>
            </div>
        </div>
    );
}