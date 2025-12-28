use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct GameEntry {
    pub id: i64,
    pub user_id: i64,
    pub game_id: i64,
    pub game_name: String,
    pub played_date: chrono::NaiveDateTime,
    pub completed: bool,
    pub created_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateGameEntry {
    pub game_id: i64,
    pub game_name: String,
    pub completed: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateGameEntry {
    pub completed: bool,
}

#[derive(Debug, Serialize)]
pub struct GameStats {
    pub total_games: i64,
    pub streak_days: i64,
    pub today_count: i64,
    pub games_by_day: Vec<DayStats>,
}

#[derive(Debug, Serialize)]
pub struct DayStats {
    pub date: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct SyncResponse {
    pub synced_count: usize,
    pub message: String,
}
