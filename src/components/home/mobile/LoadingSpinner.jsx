import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-mykisah-bg-primary flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-mykisah-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-mykisah-text-primary">Loading...</p>
            </div>
        </div>
    );
}