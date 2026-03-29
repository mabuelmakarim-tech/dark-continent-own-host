'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Plus, Check } from 'lucide-react'
import { Media, getImageUrl } from '@/lib/tmdb'
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist'

interface MediaCardProps {
  media: Media
  type: 'movie' | 'tv'
  onClick: () => void
  progress?: number
  showProgress?: boolean
  isHoveredInRow?: boolean
  onHoverChange?: (isHovered: boolean) => void
  cardIndex?: number
  totalCards?: number
}

export function MediaCard({ 
  media, 
  type, 
  onClick, 
  progress, 
  showProgress = false,
  onHoverChange,
}: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInWatchlist(isInWatchlist(media.id, type))
    }
  }, [media.id, type])

  const title = media.title || media.name || 'Unknown'
  const year = (media.release_date || media.first_air_date || '').split('-')[0]
  const imageUrl = getImageUrl(media.backdrop_path || media.poster_path, 'w780')

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inWatchlist) {
      removeFromWatchlist(media.id, type)
      setInWatchlist(false)
    } else {
      addToWatchlist(media, type)
      setInWatchlist(true)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHoverChange?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onHoverChange?.(false)
  }

  const isExpanded = isHovered

  return (
    <div
      ref={cardRef}
      className="netflix-card-wrapper relative flex-shrink-0"
      style={{
        width: '380px',
        height: '215px',
        zIndex: isExpanded ? 50 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="netflix-card absolute cursor-pointer"
        style={{
          width: isExpanded ? '460px' : '380px',
          height: isExpanded ? '300px' : '215px',
          left: '50%',
          top: isExpanded ? '-42px' : '0',
          transform: 'translateX(-50%)',
          transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
        onClick={onClick}
      >
        <div 
          className="relative w-full h-full rounded-xl overflow-hidden"
          style={{
            boxShadow: isExpanded 
              ? '0 20px 60px rgba(0, 0, 0, 0.7), 0 10px 30px rgba(0, 0, 0, 0.5)' 
              : '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 image-loading" />
          )}
          
          <img
            src={imageUrl}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isExpanded ? 'scale-110' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: isExpanded 
                ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
            }}
          />

          {/* Progress bar - now outside at bottom */}
          {showProgress && progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Always visible title (when not expanded) */}
          <div 
            className="absolute bottom-3 left-3 right-3 transition-all duration-500"
            style={{
              opacity: isExpanded ? 0 : 1,
              transform: isExpanded ? 'translateY(10px)' : 'translateY(0)',
            }}
          >
            <h3 className="text-white font-semibold text-base line-clamp-1 drop-shadow-lg">{title}</h3>
          </div>

          {/* Expanded hover content */}
          <div 
            className="absolute inset-0 flex flex-col justify-end p-5 transition-all duration-500"
            style={{
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? 'translateY(0)' : 'translateY(30px)',
            }}
          >
            <h3 className="text-white font-bold text-xl line-clamp-2 mb-3 drop-shadow-lg">{title}</h3>
            
            <div className="flex items-center gap-3">
              {/* Play button - larger */}
              <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="w-12 h-12 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all duration-400 hover:scale-110 shadow-lg"
              >
                <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
              </button>
              
              {/* Plus button - smaller */}
              <button
                onClick={handleWatchlistToggle}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-400 hover:scale-110 shadow-lg
                  ${inWatchlist 
                    ? 'bg-white text-black' 
                    : 'bg-white/20 hover:bg-white/30 text-white border-2 border-white/40'
                  }
                `}
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>

              <div className="ml-auto flex items-center gap-2">
                {year && (
                  <span className="text-white/80 text-sm font-semibold">{year}</span>
                )}

                {media.vote_average > 0 && (
                  <span className="px-2.5 py-1 rounded-md bg-yellow-500 text-black text-xs font-bold shadow-md">
                    {media.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
