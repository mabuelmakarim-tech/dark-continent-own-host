'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { NavigationBar } from '@/components/navigation-bar'
import { HomePage } from '@/components/pages/home-page'
import { MoviesPage } from '@/components/pages/movies-page'
import { SeriesPage } from '@/components/pages/series-page'
import { WatchlistPage } from '@/components/pages/watchlist-page'
import { WatchPage } from '@/components/pages/watch-page'
import { PageType, NavigationState } from '@/lib/types'
import { Media } from '@/lib/tmdb'
import { ContinueWatchingItem, WatchlistItem } from '@/lib/watchlist'

export default function StreamingApp() {
  const [navState, setNavState] = useState<NavigationState>({
    currentPage: 'home'
  })
  const [isExiting, setIsExiting] = useState(false)
  const [displayedPage, setDisplayedPage] = useState<NavigationState>({
    currentPage: 'home'
  })
  const [pageKey, setPageKey] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const navigateTo = useCallback((newState: NavigationState) => {
    // Skip if same page and no media
    if (newState.currentPage === navState.currentPage && !newState.mediaId && !navState.mediaId) {
      return
    }
    
    setIsExiting(true)
    
    setTimeout(() => {
      setNavState(newState)
      setDisplayedPage(newState)
      setPageKey(prev => prev + 1)
      setIsExiting(false)
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 300)
  }, [navState.currentPage, navState.mediaId])

  const handleNavigate = useCallback((page: PageType) => {
    navigateTo({ currentPage: page })
  }, [navigateTo])

  const handleMediaClick = useCallback((media: Media, type: 'movie' | 'tv') => {
    navigateTo({
      currentPage: 'watch',
      mediaId: media.id,
      mediaType: type
    })
  }, [navigateTo])

  const handleContinueClick = useCallback((item: ContinueWatchingItem) => {
    navigateTo({
      currentPage: 'watch',
      mediaId: item.id,
      mediaType: item.type,
      season: item.season,
      episode: item.episode
    })
  }, [navigateTo])

  const handleWatchlistClick = useCallback((item: WatchlistItem) => {
    navigateTo({
      currentPage: 'watch',
      mediaId: item.id,
      mediaType: item.type
    })
  }, [navigateTo])

  const handleBack = useCallback(() => {
    navigateTo({ currentPage: 'home' })
  }, [navigateTo])

  const renderPage = () => {
    const { currentPage, mediaId, mediaType, season, episode } = displayedPage

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onMediaClick={handleMediaClick}
            onContinueClick={handleContinueClick}
          />
        )
      case 'movies':
        return (
          <MoviesPage
            onMediaClick={(media) => handleMediaClick(media, 'movie')}
          />
        )
      case 'series':
        return (
          <SeriesPage
            onMediaClick={(media) => handleMediaClick(media, 'tv')}
          />
        )
      case 'watchlist':
        return (
          <WatchlistPage
            onMediaClick={handleWatchlistClick}
          />
        )
      case 'watch':
        if (mediaId && mediaType) {
          return (
            <WatchPage
              mediaId={mediaId}
              mediaType={mediaType}
              initialSeason={season}
              initialEpisode={episode}
              onBack={handleBack}
              onMediaClick={handleMediaClick}
            />
          )
        }
        return null
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main 
        ref={contentRef}
        key={pageKey}
        className={`
          min-h-screen
          transition-all duration-300 ease-out
          ${isExiting 
            ? 'opacity-0 translate-y-[-10px]' 
            : 'opacity-100 translate-y-0 animate-page-enter'
          }
        `}
      >
        {renderPage()}
      </main>
      {navState.currentPage !== 'watch' && (
        <NavigationBar
          currentPage={navState.currentPage}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  )
}
