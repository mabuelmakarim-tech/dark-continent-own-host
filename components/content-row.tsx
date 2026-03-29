'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Media } from '@/lib/tmdb'
import { MediaCard } from './media-card'

interface ContentRowProps {
  title: string
  items: Media[]
  type: 'movie' | 'tv'
  onMediaClick: (media: Media) => void
  showProgress?: boolean
  progressMap?: Record<number, number>
  delay?: number
}

export function ContentRow({ 
  title, 
  items, 
  type, 
  onMediaClick, 
  showProgress = false, 
  progressMap = {},
  delay = 0 
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

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
    <div 
      className="relative py-4 content-row-container animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-white text-2xl font-semibold mb-2 px-12 animate-slide-down" style={{ animationDelay: `${delay + 100}ms` }}>
        {title}
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
          style={{ scrollPaddingLeft: '48px', scrollPaddingRight: '48px' }}
        >
          {items.map((item, index) => (
            <div 
              key={item.id}
              className="transition-all duration-500"
              style={{
                transform: hoveredIndex !== null && hoveredIndex !== index
                  ? hoveredIndex < index 
                    ? 'translateX(60px)' 
                    : 'translateX(-60px)'
                  : 'translateX(0)',
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              <MediaCard
                media={item}
                type={type}
                onClick={() => onMediaClick(item)}
                progress={progressMap[item.id]}
                showProgress={showProgress && progressMap[item.id] !== undefined}
                isHoveredInRow={hoveredIndex === index}
                onHoverChange={(isHovered) => setHoveredIndex(isHovered ? index : null)}
                cardIndex={index}
                totalCards={items.length}
              />
            </div>
          ))}
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
