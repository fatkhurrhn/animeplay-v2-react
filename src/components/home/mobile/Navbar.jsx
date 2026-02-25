import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl px-4 py-2 border-b border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <i className="ri-vip-crown-line text-2xl" style={{ color: '#ffaf2f' }}></i>
                </div>

                <div className="flex items-center">
                    <span className="text-2xl font-bold tracking-tight">
                        <span className="text-white">My</span>
                        <span style={{ color: '#ffaf2f' }}>Kisah</span>
                    </span>
                </div>

                <Link to="/search" className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all">
                    <i className="ri-search-line text-xl" style={{ color: '#ffc05f' }}></i>
                </Link>
            </div>
        </nav>
    );
}