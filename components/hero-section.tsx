'use client'

import { useState, useEffect } from 'react'
import { Play, Plus, Check } from 'lucide-react'
import { Media, getImageUrl } from '@/lib/tmdb'
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist'

interface HeroSectionProps {
  media: Media
  type: 'movie' | 'tv'
  onPlay: () => void
}

export function HeroSection({ media, type, onPlay }: HeroSectionProps) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setInWatchlist(isInWatchlist(media.id, type))
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [media.id, type])

  const title = media.title || media.name || 'Unknown'
  const year = (media.release_date || media.first_air_date || '').split('-')[0]
  const backdropUrl = getImageUrl(media.backdrop_path, 'original')

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(media.id, type)
      setInWatchlist(false)
    } else {
      addToWatchlist(media, type)
      setInWatchlist(true)
    }
  }

  return (
    <div className="relative w-full h-[75vh] min-h-[550px] overflow-hidden">
      {/* Background image with parallax-like effect */}
      <div className="absolute inset-0">
        <div 
          className={`
            absolute inset-0 transition-all duration-1000 ease-out
            ${imageLoaded && isVisible ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}
          `}
        >
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-top"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        {/* Animated shine overlay */}
        <div className="absolute inset-0 opacity-20 animate-shimmer" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-52 px-12">
        {/* Title with dramatic animation */}
        <div 
          className={`
            mb-6 transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
          style={{ transitionDelay: '200ms' }}
        >
          <h1 
            className="text-6xl md:text-8xl font-bold text-white tracking-wider uppercase"
            style={{
              fontFamily: 'Impact, Haettenschweiler, sans-serif',
              letterSpacing: '0.08em',
              textShadow: '4px 4px 20px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Buttons and info with staggered animation */}
        <div 
          className={`
            flex items-center gap-5 transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
          style={{ transitionDelay: '400ms' }}
        >
          {/* Play button - larger */}
          <button
            onClick={onPlay}
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/30 group shadow-lg shadow-black/20"
          >
            <Play className="w-7 h-7 text-white ml-1 group-hover:scale-110 transition-transform" fill="white" />
          </button>

          {/* Plus button - smaller */}
          <button
            onClick={handleWatchlistToggle}
            className={`
              w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 border shadow-lg shadow-black/20
              ${inWatchlist 
                ? 'bg-white text-black border-white' 
                : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
              }
            `}
          >
            {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>

          <div 
            className={`
              flex items-center gap-4 ml-4 transition-all duration-700 ease-out
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
            `}
            style={{ transitionDelay: '600ms' }}
          >
            {year && <span className="text-white/80 text-xl font-medium">{year}</span>}
            {media.vote_average > 0 && (
              <>
                <span className="text-white/40 text-xl">•</span>
                <span className="px-3 py-1.5 rounded-lg bg-yellow-500 text-black text-sm font-bold shadow-lg shadow-yellow-500/30 animate-pulse-glow">
                  {media.vote_average.toFixed(1)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
