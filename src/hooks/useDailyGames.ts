import { useEffect, useState } from 'react';
import { Game } from './useGames';
import apiClient from '../services/api-client';

interface FetchResponse<T> {
  count: number;
  results: T[];
}

export interface DailyCategoryGames {
  daily: Game[];
  trending: Game[];
  new: Game[];
  top: Game[];
  played: Game[];
}

const useDailyGames = () => {
  const [games, setGames] = useState<DailyCategoryGames>({
    daily: [],
    trending: [],
    new: [],
    top: [],
    played: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDailyGames = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch different categories in parallel
        const [dailyRes, trendingRes, newRes, topRes] = await Promise.all([
          // Daily Pick: Random selection from popular games
          apiClient.get<FetchResponse<Game>>('/games', {
            params: { page_size: 20, ordering: '-rating', metacritic: '80,100' },
          }),
          // Trending: Most popular recently
          apiClient.get<FetchResponse<Game>>('/games', {
            params: { page_size: 15, ordering: '-added' },
          }),
          // New Releases: Recently released games
          apiClient.get<FetchResponse<Game>>('/games', {
            params: {
              page_size: 15,
              dates: `${getDateMonthsAgo(1)},${getTodayDate()}`,
              ordering: '-released',
            },
          }),
          // Top Rated: Highest rated games
          apiClient.get<FetchResponse<Game>>('/games', {
            params: { page_size: 15, ordering: '-metacritic', metacritic: '85,100' },
          }),
        ]);

        // For daily pick, select a random game (consistent for the day)
        const dailyIndex = getDailyGameIndex(dailyRes.data.results.length);
        const dailyPick = dailyRes.data.results[dailyIndex];

        setGames({
          daily: dailyPick ? [dailyPick] : [],
          trending: trendingRes.data.results,
          new: newRes.data.results,
          top: topRes.data.results,
          played: [], // Will be populated from localStorage
        });

        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch daily games');
        setIsLoading(false);
      }
    };

    fetchDailyGames();
  }, []);

  return { games, isLoading, error };
};

// Helper functions
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getDateMonthsAgo = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().split('T')[0];
};

const getDailyGameIndex = (arrayLength: number): number => {
  // Generate a consistent random index for today
  const today = getTodayDate();
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  return seed % arrayLength;
};

export default useDailyGames;
