import { DailyGameEntry, DailyGameHistory } from '../types/daily-menu';

const STORAGE_KEY = 'gamedeck_daily_history';

export const getDailyGameHistory = (): DailyGameHistory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading daily game history:', error);
    return {};
  }
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getTodayGames = (): DailyGameEntry[] => {
  const history = getDailyGameHistory();
  const today = getTodayDate();
  return history[today] || [];
};

export const addGameToToday = (gameId: number, gameName: string): void => {
  const history = getDailyGameHistory();
  const today = getTodayDate();
  const todayGames = history[today] || [];

  // Check if game already played today
  if (todayGames.some(entry => entry.gameId === gameId)) {
    return;
  }

  const newEntry: DailyGameEntry = {
    gameId,
    gameName,
    playedDate: new Date().toISOString(),
    completed: false,
  };

  history[today] = [...todayGames, newEntry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const markGameAsCompleted = (gameId: number): void => {
  const history = getDailyGameHistory();
  const today = getTodayDate();
  const todayGames = history[today] || [];

  const updatedGames = todayGames.map(entry =>
    entry.gameId === gameId ? { ...entry, completed: true } : entry
  );

  history[today] = updatedGames;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const getPlayedGamesCount = (): number => {
  const history = getDailyGameHistory();
  return Object.values(history).reduce((total, dayGames) => total + dayGames.length, 0);
};

export const getStreakDays = (): number => {
  const history = getDailyGameHistory();
  const dates = Object.keys(history).sort().reverse();

  let streak = 0;
  let currentDate = new Date();

  for (const dateStr of dates) {
    const checkDate = currentDate.toISOString().split('T')[0];
    if (dateStr === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
