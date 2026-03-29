'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Play, Trash2 } from 'lucide-react'
import { WatchlistItem, getWatchlist, removeFromWatchlist } from '@/lib/watchlist'
import { getImageUrl } from '@/lib/tmdb'

interface WatchlistPageProps {
  onMediaClick: (item: WatchlistItem) => void
}

export function WatchlistPage({ onMediaClick }: WatchlistPageProps) {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const loadWatchlist = () => {
      setItems(getWatchlist())
    }
    loadWatchlist()

    window.addEventListener('watchlist-updated', loadWatchlist)
    
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    return () => {
      window.removeEventListener('watchlist-updated', loadWatchlist)
      clearTimeout(timer)
    }
  }, [])

  const handleRemove = (e: React.MouseEvent, item: WatchlistItem) => {
    e.stopPropagation()
    removeFromWatchlist(item.id, item.type)
  }

  return (
    <div className="min-h-screen pt-20 pb-32 px-12">
      {/* Header */}
      <div 
        className={`
          flex items-center gap-5 mb-10 transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
      >
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
          <Bookmark className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">My Watchlist</h1>
          <p className="text-white/50 text-sm mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div 
          className={`
            flex flex-col items-center justify-center py-32 text-center transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center mb-8 animate-float">
            <Bookmark className="w-14 h-14 text-white/20" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-3">Your watchlist is empty</h2>
          <p className="text-white/40 max-w-md text-lg">
            Browse movies and series to add them to your watchlist. They will appear here for easy access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item, index) => {
            const itemKey = `${item.type}-${item.id}`
            const isHovered = hoveredId === itemKey
            const imageUrl = getImageUrl(item.backdrop_path || item.poster_path, 'w780')

            return (
              <div
                key={itemKey}
                className={`
                  relative cursor-pointer transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${150 + index * 50}ms` }}
                onMouseEnter={() => setHoveredId(itemKey)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onMediaClick(item)}
              >
                <div 
                  className="relative aspect-video rounded-xl overflow-hidden"
                  style={{
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: isHovered 
                      ? '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 0, 0, 0.4)' 
                      : '0 10px 30px rgba(0, 0, 0, 0.3)',
                    zIndex: isHovered ? 20 : 1,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-400"
                    style={{
                      background: isHovered 
                        ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)'
                        : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                    }}
                  />

                  {/* Remove button */}
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeFromWatchlist(item.id, item.type)
                    }}
                    className={`
                      absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 hover:bg-red-500 
                      flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer z-[100]
                      ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </div>

                  {/* Non-hovered title */}
                  <div 
                    className="absolute bottom-3 left-3 right-3 transition-all duration-400"
                    style={{
                      opacity: isHovered ? 0 : 1,
                      transform: isHovered ? 'translateY(10px)' : 'translateY(0)',
                    }}
                  >
                    <h3 className="text-white font-medium text-sm line-clamp-1 drop-shadow-lg">{item.title}</h3>
                  </div>

                  {/* Hover content */}
                  <div 
                    className="absolute inset-0 flex flex-col justify-end p-4 transition-all duration-400"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
                    }}
                  >
                    <h3 className="text-white font-semibold text-lg line-clamp-2 mb-3 drop-shadow-lg">{item.title}</h3>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onMediaClick(item); }}
                        className="w-12 h-12 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                      >
                        <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                      </button>

                      <span className="text-white/50 text-xs uppercase font-medium tracking-wider">{item.type}</span>

                      {item.vote_average > 0 && (
                        <span className="ml-auto px-2.5 py-1 rounded-md bg-yellow-500 text-black text-xs font-bold shadow-md">
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
