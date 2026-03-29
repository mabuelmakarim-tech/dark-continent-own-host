'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { getImageUrl } from '@/lib/tmdb'
import { ContinueWatchingItem, getContinueWatching, removeContinueWatching } from '@/lib/watchlist'

interface ContinueWatchingRowProps {
  onMediaClick: (item: ContinueWatchingItem) => void
}

export function ContinueWatchingRow({ onMediaClick }: ContinueWatchingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<ContinueWatchingItem[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  useEffect(() => {
    const loadItems = () => {
      setItems(getContinueWatching())
    }
    loadItems()
    
    window.addEventListener('continue-updated', loadItems)
    return () => window.removeEventListener('continue-updated', loadItems)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 1000
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 20)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20)
  }

  if (items.length === 0) return null

  return (
    <div className="relative py-4 content-row-container animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <h2 className="text-white text-2xl font-semibold mb-2 px-12 animate-slide-down" style={{ animationDelay: '150ms' }}>
        Continue Watching
      </h2>
      
      <div className="relative group/row content-row">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 z-[60] w-12 h-32 
            bg-black/60
            flex items-center justify-center
            transition-all duration-400 rounded-r-lg row-scroll-btn
            ${showLeftArrow ? '' : 'pointer-events-none !opacity-0'}
          `}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {/* Content scroll area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-12 py-10"
        >
          {items.map((item, index) => {
            const isHovered = hoveredIndex === index
            const imageUrl = getImageUrl(item.backdrop_path || item.poster_path, 'w780')

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="netflix-card-wrapper relative flex-shrink-0"
                style={{
                  width: '380px',
                  height: '240px',
                  zIndex: isHovered ? 50 : 1,
                  transform: hoveredIndex !== null && hoveredIndex !== index
                    ? hoveredIndex < index 
                      ? 'translateX(60px)' 
                      : 'translateX(-60px)'
                    : 'translateX(0)',
                  opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
                  transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="netflix-card absolute cursor-pointer"
                  style={{
                    width: isHovered ? '460px' : '380px',
                    height: isHovered ? '325px' : '240px',
                    left: '50%',
                    top: isHovered ? '-42px' : '0',
                    transform: 'translateX(-50%)',
                    transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                  onClick={() => onMediaClick(item)}
                >
                  {/* Card container with image */}
                  <div 
                    className="relative w-full rounded-xl overflow-hidden"
                    style={{
                      height: isHovered ? 'calc(100% - 8px)' : 'calc(100% - 8px)',
                      boxShadow: isHovered 
                        ? '0 20px 60px rgba(0, 0, 0, 0.7), 0 10px 30px rgba(0, 0, 0, 0.5)' 
                        : '0 4px 15px rgba(0, 0, 0, 0.3)',
                      transition: 'box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
                      loading="lazy"
                    />
                    
                    {/* Gradient overlay */}
                    <div 
                      className="absolute inset-0 transition-all duration-500"
                      style={{
                        background: isHovered 
                          ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)'
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
                        removeContinueWatching(item.id, item.type)
                      }}
                      className={`
                        absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-red-500/80 
                        flex items-center justify-center transition-all duration-400 hover:scale-110 cursor-pointer z-[100]
                        ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                      `}
                    >
                      <X className="w-4 h-4 text-white" />
                    </div>

                    {/* Non-hovered title */}
                    <div 
                      className="absolute bottom-4 left-3 right-3 transition-all duration-500"
                      style={{
                        opacity: isHovered ? 0 : 1,
                        transform: isHovered ? 'translateY(10px)' : 'translateY(0)',
                      }}
                    >
                      <h3 className="text-white font-semibold text-base line-clamp-1 drop-shadow-lg">{item.title}</h3>
                    </div>

                    {/* Hover content */}
                    <div 
                      className="absolute inset-0 flex flex-col justify-end p-5 transition-all duration-500"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateY(0)' : 'translateY(30px)',
                      }}
                    >
                      <h3 className="text-white font-bold text-xl line-clamp-1 mb-1 drop-shadow-lg">{item.title}</h3>
                      
                      {item.season && item.episode && (
                        <p className="text-white/60 text-sm mb-3">
                          Season {item.season}, Episode {item.episode}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); onMediaClick(item); }}
                          className="w-12 h-12 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all duration-400 hover:scale-110 shadow-lg"
                        >
                          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                        </button>
                        
                        <span className="text-white/60 text-sm ml-auto font-medium">
                          {Math.round((item.duration - item.currentTime) / 60)}m left
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar - OUTSIDE the card, at the very bottom */}
                  <div 
                    className="absolute bottom-0 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden"
                    style={{
                      transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                  >
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className={`
            absolute right-0 top-1/2 -translate-y-1/2 z-[60] w-12 h-32 
            bg-black/60
            flex items-center justify-center
            transition-all duration-400 rounded-l-lg row-scroll-btn
            ${showRightArrow ? '' : 'pointer-events-none !opacity-0'}
          `}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  )
}
