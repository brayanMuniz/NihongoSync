import React, { useEffect, useState } from 'react';
import { getJLPTLevelFromLN, LNTvSeasonData } from '../types/learnNativelyLevel';
import axios from 'axios';

interface TvShowData {
  searched_title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
}

interface HoveredDataProps {
  hoveredData: LNTvSeasonData | null;
  tmdbReadApiKey: string;
}

const HoveredData: React.FC<HoveredDataProps> = ({ hoveredData, tmdbReadApiKey }) => {
  const [tvImageUrl, setTvImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTvImage = async (title: string) => {
      // Check if the title already exists in localStorage
      const existingTvShows: TvShowData[] = JSON.parse(localStorage.getItem('tvShows') || '[]');
      const existingTvShow = existingTvShows.find(tvShow => tvShow.searched_title === title);

      if (existingTvShow) {
        setTvImageUrl(`https://image.tmdb.org/t/p/w500${existingTvShow.poster_path}`);
        console.log('Found Image in localStorage:');
        return;
      }

      // Title is not in Local Storage, fetch from TMDB API
      const BASE_URL = 'https://api.themoviedb.org/3';
      const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
      const BEARER_TOKEN = tmdbReadApiKey

      const url = `${BASE_URL}/search/tv?query=${encodeURIComponent(title)}&include_adult=false&language=js&page=1`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${BEARER_TOKEN}`
        }
      };

      try {
        const response = await axios.get(url, options);
        const storedtmdbReadApiKey = localStorage.getItem("tmdbReadApiKey");

        if (storedtmdbReadApiKey == null || storedtmdbReadApiKey == "" || storedtmdbReadApiKey == undefined) {
          console.log("saving in localStorage:", tmdbReadApiKey);

          localStorage.setItem("tmdbReadApiKey", tmdbReadApiKey);
        }

        const data = response.data;
        if (data.results.length > 0) {
          const tvShow: TvShowData = {
            ...data.results[0],
            searched_title: title
          };
          setTvImageUrl(`${IMAGE_BASE_URL}${tvShow.poster_path}`);
          console.log('Fetched from API:', tvShow);

          existingTvShows.push(tvShow);
          localStorage.setItem('tvShows', JSON.stringify(existingTvShows));
        } else {
          setTvImageUrl(null);
        }
      } catch (error) {
        console.error('Error fetching TV show data:', error);
        setTvImageUrl(null);
      }
    };

    if (hoveredData) {
      console.log(tmdbReadApiKey);
      if (tmdbReadApiKey != "")
        fetchTvImage(hoveredData['Series Title']);
    }
  }, [hoveredData]);

  if (!hoveredData) {
    return <p>Hover over a bar to see details</p>;
  }

  return (
    <div className="p-4">
      {tvImageUrl && (
        <div className="flex justify-center mb-4">
          <img
            src={tvImageUrl}
            alt={hoveredData['Series Title']}
            style={{ width: '200px', height: '300px', objectFit: 'cover' }}
          />
        </div>
      )}
      <div className="text-center">
        <h3 className="text-xl font-bold">{hoveredData['Series Title']}</h3>
        <p>Season #: {hoveredData['Series Order']}</p>
        <p>~JLPT {getJLPTLevelFromLN(Number(hoveredData['Difficulty Level']))}</p>
        <p>My Rating: {hoveredData['My Rating']}</p>
        <p>Hours Watched: {Math.floor(parseInt(hoveredData['Total Minutes Watched']) / 60)}</p>
        <p>Episodes Watched: {hoveredData['Episodes Watched']}</p>
        <a
          href={`https://learnnatively.com/season/${hoveredData['TV Season ID']}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline mt-2 block"
        >
          Go to LearnNatively Season
        </a>
      </div>
    </div>
  );

};

export default HoveredData;

