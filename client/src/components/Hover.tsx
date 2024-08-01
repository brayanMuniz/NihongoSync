import React, { useEffect, useState } from 'react';
import { getJLPTLevelFromLN, LNTvSeasonData } from '../types/learnNativelyLevel';
import tmdbKeys from '../clientSecrets.json';
import axios from 'axios';

interface HoveredDataProps {
  hoveredData: LNTvSeasonData | null;
}

const HoveredData: React.FC<HoveredDataProps> = ({ hoveredData }) => {
  const [tvImageUrl, setTvImageUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log(tmdbKeys.tmdbReadApiKey)
    const fetchTvImage = async (title: string) => {
      const BASE_URL = 'https://api.themoviedb.org/3';
      const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
      const BEARER_TOKEN = tmdbKeys.tmdbReadApiKey

      const url = `${BASE_URL}/search/tv?query=${encodeURIComponent(title)}&include_adult=false&language=js&page=1`;
      console.log(url)
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${BEARER_TOKEN}`
        }
      };



      try {
        const response = await axios.get(url, options);
        const data = response.data;
        if (data.results.length > 0) {
          const tvShow = data.results[0];
          setTvImageUrl(`${IMAGE_BASE_URL}${tvShow.poster_path}`);
        } else {
          setTvImageUrl(null);
        }
      } catch (error) {
        console.error('Error fetching TV show data:', error);
        setTvImageUrl(null);
      }
    };

    if (hoveredData) {
      fetchTvImage(hoveredData['Series Title']);
    }
  }, [hoveredData]);

  if (!hoveredData) {
    return <p>Hover over a bar to see details</p>;
  }

  return (
    <div>
      {tvImageUrl && <img src={tvImageUrl} alt={hoveredData['Series Title']} width="200" />}
      <h3>{hoveredData['Series Title']}</h3>
      <h3>Season #: {hoveredData['Series Order']}</h3>
      <h3>~JLPT {getJLPTLevelFromLN(Number(hoveredData['Difficulty Level']))}</h3>
      <h3>My Rating: {hoveredData['My Rating']}</h3>
      <h3>Hours Watched: {Math.floor(parseInt(hoveredData['Total Minutes Watched']) / 60)}</h3>
      <h3>Episodes Watched: {hoveredData['Episodes Watched']}</h3>
      <a
        href={`https://learnnatively.com/season/${hoveredData['TV Season ID']}/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Go to LearnNatively Season
      </a>
    </div>
  );
};

export default HoveredData;

