'use client'

import { useEffect, useState } from 'react'
import { HeroSection } from '@/components/hero-section'
import { ContentRow } from '@/components/content-row'
import { Media, getPopular, getTopRated, getNowPlaying, getUpcoming, getTrending, getGenres, discoverByGenre } from '@/lib/tmdb'

interface MoviesPageProps {
  onMediaClick: (media: Media) => void
}

export function MoviesPage({ onMediaClick }: MoviesPageProps) {
  const [heroMedia, setHeroMedia] = useState<Media | null>(null)
  const [trending, setTrending] = useState<Media[]>([])
  const [popular, setPopular] = useState<Media[]>([])
  const [topRated, setTopRated] = useState<Media[]>([])
  const [nowPlaying, setNowPlaying] = useState<Media[]>([])
  const [upcoming, setUpcoming] = useState<Media[]>([])
  const [genreRows, setGenreRows] = useState<{ name: string; items: Media[] }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [trendingData, popularData, topRatedData, nowPlayingData, upcomingData, genres] = await Promise.all([
          getTrending('movie', 'week'),
          getPopular('movie'),
          getTopRated('movie'),
          getNowPlaying(),
          getUpcoming(),
          getGenres('movie')
        ])

        // Set hero from trending
        const heroOptions = trendingData.filter(m => m.backdrop_path)
        if (heroOptions.length > 0) {
          setHeroMedia(heroOptions[Math.floor(Math.random() * Math.min(5, heroOptions.length))])
        }

        setTrending(trendingData)
        setPopular(popularData)
        setTopRated(topRatedData)
        setNowPlaying(nowPlayingData)
        setUpcoming(upcomingData)

        // Load a few genre rows
        const selectedGenres = genres.slice(0, 4)
        const genreData = await Promise.all(
          selectedGenres.map(async (genre) => ({
            name: genre.name,
            items: await discoverByGenre('movie', genre.id)
          }))
        )
        setGenreRows(genreData)
      } catch (error) {
        console.error('Error loading movies:', error)
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
          <p className="text-white/50 text-sm animate-pulse">Loading movies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      {heroMedia && (
        <HeroSection
          media={heroMedia}
          type="movie"
          onPlay={() => onMediaClick(heroMedia)}
        />
      )}

      <div className="-mt-36 relative z-10">
        <ContentRow
          title="Trending Movies"
          items={trending}
          type="movie"
          onMediaClick={onMediaClick}
          delay={100}
        />

        <ContentRow
          title="Now Playing"
          items={nowPlaying}
          type="movie"
          onMediaClick={onMediaClick}
          delay={200}
        />

        <ContentRow
          title="Coming Soon"
          items={upcoming}
          type="movie"
          onMediaClick={onMediaClick}
          delay={300}
        />

        <ContentRow
          title="Popular"
          items={popular}
          type="movie"
          onMediaClick={onMediaClick}
          delay={400}
        />

        <ContentRow
          title="Top Rated"
          items={topRated}
          type="movie"
          onMediaClick={onMediaClick}
          delay={500}
        />

        {genreRows.map((row, index) => (
          <ContentRow
            key={row.name}
            title={row.name}
            items={row.items}
            type="movie"
            onMediaClick={onMediaClick}
            delay={600 + index * 100}
          />
        ))}
      </div>
    </div>
  )
}
