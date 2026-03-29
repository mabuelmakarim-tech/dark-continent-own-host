import { Media } from './tmdb'

export interface WatchlistItem {
  id: number
  type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  addedAt: number
}

export interface ContinueWatchingItem {
  id: number
  type: 'movie' | 'tv'
  title: string
  poster_path: string | null
  backdrop_path: string | null
  progress: number // 0-100
  currentTime: number // seconds
  duration: number // seconds
  season?: number
  episode?: number
  lastWatched: number
}

const WATCHLIST_KEY = 'streamtv_watchlist'
const CONTINUE_KEY = 'streamtv_continue'

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(WATCHLIST_KEY)
  return data ? JSON.parse(data) : []
}

export function addToWatchlist(media: Media, type: 'movie' | 'tv'): void {
  const watchlist = getWatchlist()
  const exists = watchlist.find(item => item.id === media.id && item.type === type)
  if (exists) return
  
  const item: WatchlistItem = {
    id: media.id,
    type,
    title: media.title || media.name || 'Unknown',
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    vote_average: media.vote_average,
    addedAt: Date.now()
  }
  
  watchlist.unshift(item)
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
  window.dispatchEvent(new Event('watchlist-updated'))
}

export function removeFromWatchlist(id: number, type: 'movie' | 'tv'): void {
  const watchlist = getWatchlist()
  const filtered = watchlist.filter(item => !(item.id === id && item.type === type))
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered))
  window.dispatchEvent(new Event('watchlist-updated'))
}

export function isInWatchlist(id: number, type: 'movie' | 'tv'): boolean {
  const watchlist = getWatchlist()
  return watchlist.some(item => item.id === id && item.type === type)
}

export function getContinueWatching(): ContinueWatchingItem[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(CONTINUE_KEY)
  return data ? JSON.parse(data) : []
}

export function updateContinueWatching(
  media: Media,
  type: 'movie' | 'tv',
  currentTime: number,
  duration: number,
  season?: number,
  episode?: number
): void {
  const items = getContinueWatching()
  const progress = Math.round((currentTime / duration) * 100)
  
  // Remove if finished (>95%)
  if (progress > 95) {
    const filtered = items.filter(item => !(item.id === media.id && item.type === type))
    localStorage.setItem(CONTINUE_KEY, JSON.stringify(filtered))
    window.dispatchEvent(new Event('continue-updated'))
    return
  }
  
  const existingIndex = items.findIndex(item => item.id === media.id && item.type === type)
  
  const newItem: ContinueWatchingItem = {
    id: media.id,
    type,
    title: media.title || media.name || 'Unknown',
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    progress,
    currentTime,
    duration,
    season,
    episode,
    lastWatched: Date.now()
  }
  
  if (existingIndex >= 0) {
    items[existingIndex] = newItem
  } else {
    items.unshift(newItem)
  }
  
  // Keep only last 20 items
  const limited = items.slice(0, 20)
  localStorage.setItem(CONTINUE_KEY, JSON.stringify(limited))
  window.dispatchEvent(new Event('continue-updated'))
}

export function removeContinueWatching(id: number, type: 'movie' | 'tv'): void {
  const items = getContinueWatching()
  const filtered = items.filter(item => !(item.id === id && item.type === type))
  localStorage.setItem(CONTINUE_KEY, JSON.stringify(filtered))
  window.dispatchEvent(new Event('continue-updated'))
}
