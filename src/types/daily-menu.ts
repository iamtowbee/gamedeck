export interface DailyGameEntry {
  gameId: number;
  gameName: string;
  playedDate: string; // ISO date string
  completed: boolean;
}

export interface DailyGameHistory {
  [date: string]: DailyGameEntry[];
}

export interface MenuCategory {
  id: string;
  title: string;
  icon?: string;
  color: string;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'daily', title: 'Daily Pick', color: '#00A8E1' },
  { id: 'trending', title: 'Trending Now', color: '#FF6B35' },
  { id: 'new', title: 'New Releases', color: '#4ECDC4' },
  { id: 'top', title: 'Top Rated', color: '#FFD700' },
  { id: 'played', title: 'My History', color: '#9B59B6' },
];
