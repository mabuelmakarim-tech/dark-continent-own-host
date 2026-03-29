'use client'

import { useEffect, useState } from 'react'
import { HeroSection } from '@/components/hero-section'
import { ContentRow } from '@/components/content-row'
import { Media, getPopular, getTopRated, getOnTheAir, getTrending, getGenres, discoverByGenre } from '@/lib/tmdb'

interface SeriesPageProps {
  onMediaClick: (media: Media) => void
}

export function SeriesPage({ onMediaClick }: SeriesPageProps) {
  const [heroMedia, setHeroMedia] = useState<Media | null>(null)
  const [trending, setTrending] = useState<Media[]>([])
  const [popular, setPopular] = useState<Media[]>([])
  const [topRated, setTopRated] = useState<Media[]>([])
  const [onTheAir, setOnTheAir] = useState<Media[]>([])
  const [genreRows, setGenreRows] = useState<{ name: string; items: Media[] }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [trendingData, popularData, topRatedData, onTheAirData, genres] = await Promise.all([
          getTrending('tv', 'week'),
          getPopular('tv'),
          getTopRated('tv'),
          getOnTheAir(),
          getGenres('tv')
        ])

        // Set hero from trending
        const heroOptions = trendingData.filter(m => m.backdrop_path)
        if (heroOptions.length > 0) {
          setHeroMedia(heroOptions[Math.floor(Math.random() * Math.min(5, heroOptions.length))])
        }

        setTrending(trendingData)
        setPopular(popularData)
        setTopRated(topRatedData)
        setOnTheAir(onTheAirData)

        // Load a few genre rows
        const selectedGenres = genres.slice(0, 4)
        const genreData = await Promise.all(
          selectedGenres.map(async (genre) => ({
            name: genre.name,
            items: await discoverByGenre('tv', genre.id)
          }))
        )
        setGenreRows(genreData)
      } catch (error) {
        console.error('Error loading series:', error)
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
          <p className="text-white/50 text-sm animate-pulse">Loading series...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      {heroMedia && (
        <HeroSection
          media={heroMedia}
          type="tv"
          onPlay={() => onMediaClick(heroMedia)}
        />
      )}

      <div className="-mt-36 relative z-10">
        <ContentRow
          title="Trending Series"
          items={trending}
          type="tv"
          onMediaClick={onMediaClick}
          delay={100}
        />

        <ContentRow
          title="On The Air"
          items={onTheAir}
          type="tv"
          onMediaClick={onMediaClick}
          delay={200}
        />

        <ContentRow
          title="Popular"
          items={popular}
          type="tv"
          onMediaClick={onMediaClick}
          delay={300}
        />

        <ContentRow
          title="Top Rated"
          items={topRated}
          type="tv"
          onMediaClick={onMediaClick}
          delay={400}
        />

        {genreRows.map((row, index) => (
          <ContentRow
            key={row.name}
            title={row.name}
            items={row.items}
            type="tv"
            onMediaClick={onMediaClick}
            delay={500 + index * 100}
          />
        ))}
      </div>
    </div>
  )
}
