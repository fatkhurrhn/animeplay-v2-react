import React from 'react';

export default function ScrollToTop() {
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-4 w-10 h-10 bg-mykisah-primary rounded-full flex items-center justify-center shadow-lg hover:bg-mykisah-accent transition-colors"
        >
            <i className="ri-arrow-up-line text-black text-lg"></i>
        </button>
    );
}