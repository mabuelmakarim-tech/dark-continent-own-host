const TMDB_API_KEY = '1fd7b0c37fce4c7e5a5a7b2e509b9e7e'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export interface Media {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: 'movie' | 'tv'
  genre_ids?: number[]
}

export interface MediaDetails extends Media {
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
  genres: { id: number; name: string }[]
  tagline?: string
  status: string
  production_companies: { id: number; name: string; logo_path: string | null }[]
  images?: {
    logos: { file_path: string; aspect_ratio: number }[]
  }
}

export interface SearchResult {
  id: number
  title?: string
  name?: string
  media_type: 'movie' | 'tv' | 'person'
  poster_path: string | null
  release_date?: string
  first_air_date?: string
}

export function getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string {
  if (!path) return '/placeholder.jpg'
  return `${IMAGE_BASE_URL}/${size}${path}`
}

export async function fetchTMDB<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}

export async function getTrending(type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') {
  const data = await fetchTMDB<{ results: Media[] }>(`/trending/${type}/${timeWindow}`)
  return data.results
}

export async function getPopular(type: 'movie' | 'tv') {
  const data = await fetchTMDB<{ results: Media[] }>(`/${type}/popular`)
  return data.results
}

export async function getTopRated(type: 'movie' | 'tv') {
  const data = await fetchTMDB<{ results: Media[] }>(`/${type}/top_rated`)
  return data.results
}

export async function getNowPlaying() {
  const data = await fetchTMDB<{ results: Media[] }>(`/movie/now_playing`)
  return data.results
}

export async function getUpcoming() {
  const data = await fetchTMDB<{ results: Media[] }>(`/movie/upcoming`)
  return data.results
}

export async function getOnTheAir() {
  const data = await fetchTMDB<{ results: Media[] }>(`/tv/on_the_air`)
  return data.results
}

export async function getMediaDetails(type: 'movie' | 'tv', id: number): Promise<MediaDetails> {
  return fetchTMDB<MediaDetails>(`/${type}/${id}?append_to_response=images&include_image_language=en,null`)
}

export async function searchMulti(query: string) {
  const data = await fetchTMDB<{ results: SearchResult[] }>(`/search/multi?query=${encodeURIComponent(query)}`)
  return data.results.filter(r => r.media_type !== 'person')
}

export async function getSimilar(type: 'movie' | 'tv', id: number) {
  const data = await fetchTMDB<{ results: Media[] }>(`/${type}/${id}/similar`)
  return data.results
}

export async function getRecommendations(type: 'movie' | 'tv', id: number) {
  const data = await fetchTMDB<{ results: Media[] }>(`/${type}/${id}/recommendations`)
  return data.results
}

export async function getGenres(type: 'movie' | 'tv') {
  const data = await fetchTMDB<{ genres: { id: number; name: string }[] }>(`/genre/${type}/list`)
  return data.genres
}

export async function discoverByGenre(type: 'movie' | 'tv', genreId: number) {
  const data = await fetchTMDB<{ results: Media[] }>(`/discover/${type}?with_genres=${genreId}`)
  return data.results
}

export interface Episode {
  id: number
  name: string
  overview: string
  episode_number: number
  season_number: number
  still_path: string | null
  air_date: string
  vote_average: number
  runtime: number | null
}

export interface SeasonDetails {
  id: number
  name: string
  overview: string
  season_number: number
  episode_count: number
  episodes: Episode[]
  poster_path: string | null
  air_date: string
}

export async function getSeasonDetails(tvId: number, seasonNumber: number): Promise<SeasonDetails> {
  return fetchTMDB<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`)
}

export function getVidsrcUrl(type: 'movie' | 'tv', id: number, season?: number, episode?: number): string {
  if (type === 'tv' && season && episode) {
    return `https://vidfast.pro/tv/${id}/${season}/${episode}`
  }
  return `https://vidfast.pro/${type}/${id}`
}
