export type PageType = 'home' | 'movies' | 'series' | 'watchlist' | 'watch'

export interface NavigationState {
  currentPage: PageType
  mediaId?: number
  mediaType?: 'movie' | 'tv'
  season?: number
  episode?: number
}
