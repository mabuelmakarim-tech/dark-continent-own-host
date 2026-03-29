'use client'

import { useEffect, useState } from 'react'
import { HeroSection } from '@/components/hero-section'
import { ContinueWatchingRow } from '@/components/continue-watching-row'
import { ContentRow } from '@/components/content-row'
import { Media, getTrending, getPopular, getTopRated, getNowPlaying, getOnTheAir } from '@/lib/tmdb'
import { ContinueWatchingItem, getContinueWatching } from '@/lib/watchlist'

interface HomePageProps {
  onMediaClick: (media: Media, type: 'movie' | 'tv') => void
  onContinueClick: (item: ContinueWatchingItem) => void
}

export function HomePage({ onMediaClick, onContinueClick }: HomePageProps) {
  const [heroMedia, setHeroMedia] = useState<Media | null>(null)
  const [heroType, setHeroType] = useState<'movie' | 'tv'>('tv')
  const [trendingMovies, setTrendingMovies] = useState<Media[]>([])
  const [trendingSeries, setTrendingSeries] = useState<Media[]>([])
  const [popularMovies, setPopularMovies] = useState<Media[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([])
  const [nowPlaying, setNowPlaying] = useState<Media[]>([])
  const [onTheAir, setOnTheAir] = useState<Media[]>([])
  const [continueProgress, setContinueProgress] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [trending, movies, series, popular, topRated, playing, air] = await Promise.all([
          getTrending('all', 'week'),
          getTrending('movie', 'week'),
          getTrending('tv', 'week'),
          getPopular('movie'),
          getTopRated('movie'),
          getNowPlaying(),
          getOnTheAir()
        ])

        // Pick a random item with good backdrop for hero
        const heroOptions = trending.filter(m => m.backdrop_path)
        if (heroOptions.length > 0) {
          const randomHero = heroOptions[Math.floor(Math.random() * Math.min(5, heroOptions.length))]
          setHeroMedia(randomHero)
          setHeroType(randomHero.media_type === 'tv' ? 'tv' : 'movie')
        }

        setTrendingMovies(movies)
        setTrendingSeries(series)
        setPopularMovies(popular)
        setTopRatedMovies(topRated)
        setNowPlaying(playing)
        setOnTheAir(air)

        // Get progress for continue watching
        const continueItems = getContinueWatching()
        const progressMap: Record<number, number> = {}
        continueItems.forEach(item => {
          progressMap[item.id] = item.progress
        })
        setContinueProgress(progressMap)
      } catch (error) {
        console.error('Error loading home data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
          <p className="text-white/50 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      {heroMedia && (
        <HeroSection
          media={heroMedia}
          type={heroType}
          onPlay={() => onMediaClick(heroMedia, heroType)}
        />
      )}

      <div className="-mt-36 relative z-10">
        <ContinueWatchingRow onMediaClick={onContinueClick} />

        <ContentRow
          title="Trending Movies"
          items={trendingMovies}
          type="movie"
          onMediaClick={(media) => onMediaClick(media, 'movie')}
          showProgress
          progressMap={continueProgress}
          delay={200}
        />

        <ContentRow
          title="Trending Series"
          items={trendingSeries}
          type="tv"
          onMediaClick={(media) => onMediaClick(media, 'tv')}
          delay={300}
        />

        <ContentRow
          title="Now Playing"
          items={nowPlaying}
          type="movie"
          onMediaClick={(media) => onMediaClick(media, 'movie')}
          delay={400}
        />

        <ContentRow
          title="Popular Movies"
          items={popularMovies}
          type="movie"
          onMediaClick={(media) => onMediaClick(media, 'movie')}
          delay={500}
        />

        <ContentRow
          title="On The Air"
          items={onTheAir}
          type="tv"
          onMediaClick={(media) => onMediaClick(media, 'tv')}
          delay={600}
        />

        <ContentRow
          title="Top Rated"
          items={topRatedMovies}
          type="movie"
          onMediaClick={(media) => onMediaClick(media, 'movie')}
          delay={700}
        />
      </div>
    </div>
  )
}
