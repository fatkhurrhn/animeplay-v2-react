import React from 'react'
import Top10Anime from '../../components/Top10Anime'
import PopularToday from '../../components/PopularToday'

export default function Explore() {
    return (
        <>
            <div className="p-1">
                <Top10Anime />
                <PopularToday />
            </div>
        </>

    )
}