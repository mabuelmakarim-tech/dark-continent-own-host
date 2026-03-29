'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ArrowLeft, Plus, Check, ChevronDown, Search, X } from 'lucide-react'
import { MediaDetails, getMediaDetails, getImageUrl, getSimilar, getVidsrcUrl, Media, getSeasonDetails, Episode, SeasonDetails } from '@/lib/tmdb'
import { addToWatchlist, removeFromWatchlist, isInWatchlist, updateContinueWatching } from '@/lib/watchlist'
import { ContentRow } from '@/components/content-row'

interface WatchPageProps {
  mediaId: number
  mediaType: 'movie' | 'tv'
  initialSeason?: number
  initialEpisode?: number
  onBack: () => void
  onMediaClick: (media: Media, type: 'movie' | 'tv') => void
}

export function WatchPage({ mediaId, mediaType, initialSeason = 1, initialEpisode = 1, onBack, onMediaClick }: WatchPageProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null)
  const [similar, setSimilar] = useState<Media[]>([])
  const [inWatchlist, setInWatchlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSeason, setCurrentSeason] = useState(initialSeason)
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode)
  const [showSeasonPicker, setShowSeasonPicker] = useState(false)
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null)
  const [episodeSearch, setEpisodeSearch] = useState('')
  const [loadingSeasonDetails, setLoadingSeasonDetails] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const episodeListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [detailsData, similarData] = await Promise.all([
          getMediaDetails(mediaType, mediaId),
          getSimilar(mediaType, mediaId)
        ])
        setDetails(detailsData)
        setSimilar(similarData)
        setInWatchlist(isInWatchlist(mediaId, mediaType))
      } catch (error) {
        console.error('Error loading media details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    setCurrentSeason(initialSeason)
    setCurrentEpisode(initialEpisode)
  }, [mediaId, mediaType, initialSeason, initialEpisode])

  // Load season details when season changes
  useEffect(() => {
    async function loadSeasonDetails() {
      if (mediaType !== 'tv' || !details) return
      setLoadingSeasonDetails(true)
      try {
        const data = await getSeasonDetails(mediaId, currentSeason)
        setSeasonDetails(data)
      } catch (error) {
        console.error('Error loading season details:', error)
      } finally {
        setLoadingSeasonDetails(false)
      }
    }

    if (showSeasonPicker && mediaType === 'tv') {
      loadSeasonDetails()
    }
  }, [mediaId, mediaType, currentSeason, showSeasonPicker, details])

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowSeasonPicker(false)
        setEpisodeSearch('')
      }
    }
    if (showSeasonPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSeasonPicker])

  // Track watch progress
  const trackProgress = useCallback(() => {
    if (!details) return
    
    const duration = mediaType === 'movie' ? (details.runtime || 120) * 60 : 45 * 60
    const currentTime = duration * 0.3
    
    updateContinueWatching(
      details as Media,
      mediaType,
      currentTime,
      duration,
      mediaType === 'tv' ? currentSeason : undefined,
      mediaType === 'tv' ? currentEpisode : undefined
    )
  }, [details, mediaType, currentSeason, currentEpisode])

  useEffect(() => {
    return () => {
      trackProgress()
    }
  }, [trackProgress])

  const handleWatchlistToggle = () => {
    if (!details) return
    if (inWatchlist) {
      removeFromWatchlist(mediaId, mediaType)
      setInWatchlist(false)
    } else {
      addToWatchlist(details as Media, mediaType)
      setInWatchlist(true)
    }
  }

  const handleEpisodeSelect = (episodeNum: number) => {
    setCurrentEpisode(episodeNum)
    setShowSeasonPicker(false)
    setEpisodeSearch('')
  }

  // Filter episodes based on search
  const filteredEpisodes = seasonDetails?.episodes.filter(ep => {
    if (!episodeSearch) return true
    const query = episodeSearch.toLowerCase()
    const matchesNumber = ep.episode_number.toString().includes(query)
    const matchesName = ep.name.toLowerCase().includes(query)
    return matchesNumber || matchesName
  }) || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50 font-semibold">Failed to load content</p>
      </div>
    )
  }

  const title = details.title || details.name || 'Unknown'
  const year = (details.release_date || details.first_air_date || '').split('-')[0]
  const videoUrl = getVidsrcUrl(mediaType, mediaId, mediaType === 'tv' ? currentSeason : undefined, mediaType === 'tv' ? currentEpisode : undefined)
  const backdropUrl = getImageUrl(details.backdrop_path, 'original')
  const seasons = details.number_of_seasons || 1

  return (
    <div className="min-h-screen pb-32 animate-fade-in">
      {/* Full blurred background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px) brightness(0.3)',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 z-0 bg-black/50" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full glass-dark flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Floating video player */}
      <div className="relative z-10 pt-20 px-8 md:px-16 lg:px-24">
        <div 
          className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl"
          style={{
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="relative w-full aspect-video bg-black">
            <iframe
              ref={iframeRef}
              src={videoUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>

      {/* Content info */}
      <div className="relative z-10 px-8 md:px-16 lg:px-24 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 hidden md:block animate-fade-in-up">
              <img
                src={getImageUrl(details.poster_path, 'w300')}
                alt={title}
                className="w-40 rounded-xl shadow-2xl"
                style={{ boxShadow: '0 15px 50px rgba(0, 0, 0, 0.5)' }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{title}</h1>

              <div className="flex items-center gap-4 mb-6 flex-wrap">
                {year && <span className="text-white/70 font-semibold">{year}</span>}
                {details.runtime && <span className="text-white/70 font-semibold">{details.runtime} min</span>}
                {details.number_of_seasons && (
                  <span className="text-white/70 font-semibold">{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span>
                )}
                {details.vote_average > 0 && (
                  <span className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm font-bold">
                    {details.vote_average.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {details.genres.map((genre, index) => (
                  <span 
                    key={genre.id} 
                    className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm font-semibold animate-fade-in"
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleWatchlistToggle}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-semibold btn-hover
                    ${inWatchlist 
                      ? 'bg-white text-black' 
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }
                  `}
                >
                  {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>

                {/* Season/Episode picker for TV */}
                {mediaType === 'tv' && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowSeasonPicker(!showSeasonPicker)}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 btn-hover font-semibold"
                    >
                      <span>S{currentSeason} E{currentEpisode}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSeasonPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {showSeasonPicker && (
                      <div 
                        className="absolute bottom-full left-0 mb-3 glass rounded-2xl shadow-2xl border border-white/20 animate-scale-in overflow-hidden"
                        style={{ 
                          width: '420px',
                          zIndex: 9999,
                        }}
                      >
                        {/* Episode search */}
                        <div className="p-4 border-b border-gray-200/30">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="text"
                              value={episodeSearch}
                              onChange={(e) => setEpisodeSearch(e.target.value)}
                              placeholder="Search by name or episode number..."
                              className="w-full pl-10 pr-10 py-2.5 bg-white/70 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm font-medium transition-all duration-200"
                            />
                            {episodeSearch && (
                              <button 
                                onClick={() => setEpisodeSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Season tabs */}
                        <div className="flex gap-2 p-3 border-b border-gray-200/30 overflow-x-auto hide-scrollbar">
                          {Array.from({ length: seasons }, (_, s) => s + 1).map((season) => (
                            <button
                              key={season}
                              onClick={() => {
                                setCurrentSeason(season)
                                setEpisodeSearch('')
                              }}
                              className={`
                                flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                                ${currentSeason === season 
                                  ? 'bg-white text-black shadow-md' 
                                  : 'bg-white/30 text-gray-700 hover:bg-white/50'
                                }
                              `}
                            >
                              S{season}
                            </button>
                          ))}
                        </div>

                        {/* Episodes list */}
                        <div 
                          ref={episodeListRef}
                          className="overflow-y-auto overscroll-contain"
                          style={{ maxHeight: '350px' }}
                        >
                          {loadingSeasonDetails ? (
                            <div className="p-8 text-center">
                              <div className="inline-block w-6 h-6 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                            </div>
                          ) : filteredEpisodes.length > 0 ? (
                            filteredEpisodes.map((episode) => (
                              <button
                                key={episode.id}
                                type="button"
                                onClick={() => handleEpisodeSelect(episode.episode_number)}
                                className={`
                                  w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-200
                                  hover:bg-white/50 active:bg-white/60
                                  ${currentSeason === episode.season_number && currentEpisode === episode.episode_number
                                    ? 'bg-white/60'
                                    : ''
                                  }
                                `}
                              >
                                {episode.still_path ? (
                                  <img
                                    src={getImageUrl(episode.still_path, 'w200')}
                                    alt=""
                                    className="w-24 h-14 object-cover rounded-lg flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-24 h-14 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-gray-500 text-xs font-semibold">No Image</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`
                                      text-xs font-bold px-2 py-0.5 rounded-md
                                      ${currentSeason === episode.season_number && currentEpisode === episode.episode_number
                                        ? 'bg-black text-white'
                                        : 'bg-gray-300 text-gray-700'
                                      }
                                    `}>
                                      E{episode.episode_number}
                                    </span>
                                    {episode.runtime && (
                                      <span className="text-gray-500 text-xs font-semibold">{episode.runtime}m</span>
                                    )}
                                  </div>
                                  <p className="text-gray-900 font-bold text-sm truncate">{episode.name}</p>
                                  {episode.overview && (
                                    <p className="text-gray-600 text-xs font-medium line-clamp-1 mt-0.5">{episode.overview}</p>
                                  )}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-8 text-center text-gray-500 text-sm font-semibold">
                              No episodes found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Overview */}
              {details.overview && (
                <p className="text-white/70 text-lg leading-relaxed max-w-3xl font-medium">
                  {details.overview}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Similar content */}
        {similar.length > 0 && (
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <ContentRow
              title="More Like This"
              items={similar}
              type={mediaType}
              onMediaClick={(media) => onMediaClick(media, mediaType)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
