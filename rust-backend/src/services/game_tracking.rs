use crate::models::{CreateGameEntry, GameEntry, GameStats, DayStats, UpdateGameEntry};
use crate::db::DbPool;
use chrono::{NaiveDate, Utc};

pub async fn add_game_entry(
    pool: &DbPool,
    user_id: i64,
    entry_data: CreateGameEntry,
) -> Result<GameEntry, String> {
    let now = Utc::now().naive_utc();

    let result = sqlx::query(
        r#"
        INSERT INTO game_entries (user_id, game_id, game_name, played_date, completed)
        VALUES (?, ?, ?, ?, ?)
        "#,
    )
    .bind(user_id)
    .bind(entry_data.game_id)
    .bind(&entry_data.game_name)
    .bind(&now)
    .bind(entry_data.completed.unwrap_or(false))
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to add game entry: {}", e))?;

    let entry_id = result.last_insert_rowid();

    let entry: GameEntry = sqlx::query_as(
        r#"
        SELECT id, user_id, game_id, game_name, played_date, completed, created_at
        FROM game_entries
        WHERE id = ?
        "#,
    )
    .bind(entry_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to fetch game entry: {}", e))?;

    Ok(entry)
}

pub async fn get_user_games(pool: &DbPool, user_id: i64) -> Result<Vec<GameEntry>, String> {
    let entries: Vec<GameEntry> = sqlx::query_as(
        r#"
        SELECT id, user_id, game_id, game_name, played_date, completed, created_at
        FROM game_entries
        WHERE user_id = ?
        ORDER BY played_date DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to fetch game entries: {}", e))?;

    Ok(entries)
}

pub async fn get_today_games(pool: &DbPool, user_id: i64) -> Result<Vec<GameEntry>, String> {
    let today = Utc::now().naive_utc().date();

    let entries: Vec<GameEntry> = sqlx::query_as(
        r#"
        SELECT id, user_id, game_id, game_name, played_date, completed, created_at
        FROM game_entries
        WHERE user_id = ?
        AND DATE(played_date) = ?
        ORDER BY played_date DESC
        "#,
    )
    .bind(user_id)
    .bind(today)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to fetch today's games: {}", e))?;

    Ok(entries)
}

pub async fn update_game_entry(
    pool: &DbPool,
    user_id: i64,
    entry_id: i64,
    update_data: UpdateGameEntry,
) -> Result<GameEntry, String> {
    sqlx::query(
        r#"
        UPDATE game_entries
        SET completed = ?
        WHERE id = ? AND user_id = ?
        "#,
    )
    .bind(update_data.completed)
    .bind(entry_id)
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update game entry: {}", e))?;

    let entry: GameEntry = sqlx::query_as(
        r#"
        SELECT id, user_id, game_id, game_name, played_date, completed, created_at
        FROM game_entries
        WHERE id = ? AND user_id = ?
        "#,
    )
    .bind(entry_id)
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to fetch updated entry: {}", e))?;

    Ok(entry)
}

pub async fn get_game_stats(pool: &DbPool, user_id: i64) -> Result<GameStats, String> {
    // Get total games
    let total: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(*)
        FROM game_entries
        WHERE user_id = ?
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to get total games: {}", e))?;

    // Get today's count
    let today = Utc::now().naive_utc().date();
    let today_count: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(*)
        FROM game_entries
        WHERE user_id = ?
        AND DATE(played_date) = ?
        "#,
    )
    .bind(user_id)
    .bind(today)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to get today's count: {}", e))?;

    // Calculate streak
    let streak = calculate_streak(pool, user_id).await?;

    // Get games by day (last 30 days)
    let games_by_day: Vec<(String, i64)> = sqlx::query_as(
        r#"
        SELECT DATE(played_date) as date, COUNT(*) as count
        FROM game_entries
        WHERE user_id = ?
        AND played_date >= DATE('now', '-30 days')
        GROUP BY DATE(played_date)
        ORDER BY date DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to get games by day: {}", e))?;

    let day_stats: Vec<DayStats> = games_by_day
        .into_iter()
        .map(|(date, count)| DayStats { date, count })
        .collect();

    Ok(GameStats {
        total_games: total.0,
        streak_days: streak,
        today_count: today_count.0,
        games_by_day: day_stats,
    })
}

async fn calculate_streak(pool: &DbPool, user_id: i64) -> Result<i64, String> {
    let dates: Vec<(String,)> = sqlx::query_as(
        r#"
        SELECT DISTINCT DATE(played_date) as date
        FROM game_entries
        WHERE user_id = ?
        ORDER BY date DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to get dates: {}", e))?;

    if dates.is_empty() {
        return Ok(0);
    }

    let mut streak = 0i64;
    let mut current_date = Utc::now().naive_utc().date();

    for (date_str,) in dates {
        if let Ok(date) = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d") {
            if date == current_date {
                streak += 1;
                current_date = current_date.pred_opt().unwrap_or(current_date);
            } else {
                break;
            }
        }
    }

    Ok(streak)
}

pub async fn delete_game_entry(pool: &DbPool, user_id: i64, entry_id: i64) -> Result<(), String> {
    sqlx::query(
        r#"
        DELETE FROM game_entries
        WHERE id = ? AND user_id = ?
        "#,
    )
    .bind(entry_id)
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete game entry: {}", e))?;

    Ok(())
}
