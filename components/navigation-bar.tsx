'use client'

import { Home, Film, Tv, Bookmark, User, Search, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { searchMulti, SearchResult, getImageUrl } from '@/lib/tmdb'
import { PageType } from '@/lib/types'

interface NavigationBarProps {
  currentPage: PageType
  onNavigate: (page: PageType, mediaId?: number, mediaType?: 'movie' | 'tv') => void
}

export function NavigationBar({ currentPage, onNavigate }: NavigationBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await searchMulti(query)
      setSearchResults(results.slice(0, 10))
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (result: SearchResult) => {
    if (result.media_type === 'movie' || result.media_type === 'tv') {
      onNavigate('watch', result.id, result.media_type)
    }
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleNavigate = (page: PageType) => {
    onNavigate(page)
  }

  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'movies' as const, icon: Film, label: 'Movies' },
    { id: 'series' as const, icon: Tv, label: 'Series' },
    { id: 'watchlist' as const, icon: Bookmark, label: 'Watchlist' },
  ]

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up" ref={navRef}>
      {/* Search overlay - same width as navbar */}
      {searchOpen && (
        <div 
          ref={searchRef}
          className="absolute bottom-full left-0 right-0 mb-4 dropdown-animate"
        >
          <div className="glass rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies & shows..."
                  className="w-full pl-12 pr-12 py-3 bg-white/60 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 text-base font-semibold transition-all duration-200"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {(searchResults.length > 0 || isSearching) && (
              <div className="max-h-96 overflow-y-auto border-t border-gray-200/50">
                {isSearching ? (
                  <div className="p-6 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  searchResults.map((result, index) => (
                    <button
                      key={`${result.media_type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/60 transition-all duration-200 text-left group animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      {result.poster_path ? (
                        <img
                          src={getImageUrl(result.poster_path, 'w200')}
                          alt=""
                          className="w-12 h-16 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {result.media_type === 'movie' ? <Film className="w-5 h-5 text-gray-400" /> : <Tv className="w-5 h-5 text-gray-400" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-bold text-sm truncate group-hover:text-black transition-colors">
                          {result.title || result.name}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5 font-semibold">
                          {result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0] || 'N/A'}
                          {' '}&middot;{' '}
                          {result.media_type === 'movie' ? 'Movie' : 'Series'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass rounded-full px-1.5 py-1.5 flex items-center justify-center shadow-2xl border border-white/10">
        {/* Navigation items */}
        <div className="flex items-center justify-center gap-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`
                relative flex items-center justify-center gap-2.5 px-8 py-4 rounded-full transition-all duration-500 ease-out
                ${currentPage === item.id 
                  ? 'bg-white text-black font-bold shadow-lg scale-105' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 font-semibold'
                }
              `}
            >
              <item.icon className={`w-[18px] h-[18px] transition-all duration-500 ${currentPage === item.id ? 'scale-110' : ''}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="w-px h-7 bg-gray-300/50 mx-2" />
        
        {/* User and Search buttons */}
        <div className="flex items-center justify-center gap-0.5">
          <button className="p-4 rounded-full text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-300 hover:scale-110">
            <User className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-4 rounded-full transition-all duration-300 ${
              searchOpen ? 'bg-white text-black shadow-lg scale-110' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:scale-110'
            }`}
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  )
}
