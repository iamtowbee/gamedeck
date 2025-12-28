use crate::models::{AuthResponse, LoginUser, RegisterUser, User, UserResponse};
use crate::db::DbPool;
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use chrono::{Duration, Utc};

const JWT_SECRET: &str = "your-secret-key-change-in-production";

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i64,
    pub username: String,
    pub exp: i64,
}

pub async fn register_user(pool: &DbPool, user_data: RegisterUser) -> Result<AuthResponse, String> {
    // Hash password
    let password_hash = hash(&user_data.password, DEFAULT_COST)
        .map_err(|_| "Failed to hash password")?;

    // Insert user into database
    let result = sqlx::query(
        r#"
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
        "#,
    )
    .bind(&user_data.username)
    .bind(&user_data.email)
    .bind(&password_hash)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create user: {}", e))?;

    let user_id = result.last_insert_rowid();

    // Fetch created user
    let user: User = sqlx::query_as(
        r#"
        SELECT id, username, password_hash, email, created_at
        FROM users
        WHERE id = ?
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to fetch user: {}", e))?;

    // Generate JWT token
    let token = generate_token(user.id, &user.username)?;

    Ok(AuthResponse {
        token,
        user: user.into(),
    })
}

pub async fn login_user(pool: &DbPool, login_data: LoginUser) -> Result<AuthResponse, String> {
    // Fetch user from database
    let user: User = sqlx::query_as(
        r#"
        SELECT id, username, password_hash, email, created_at
        FROM users
        WHERE username = ?
        "#,
    )
    .bind(&login_data.username)
    .fetch_one(pool)
    .await
    .map_err(|_| "Invalid username or password")?;

    // Verify password
    verify(&login_data.password, &user.password_hash)
        .map_err(|_| "Invalid username or password")?
        .then_some(())
        .ok_or("Invalid username or password")?;

    // Generate JWT token
    let token = generate_token(user.id, &user.username)?;

    Ok(AuthResponse {
        token,
        user: user.into(),
    })
}

pub fn generate_token(user_id: i64, username: &str) -> Result<String, String> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(7))
        .ok_or("Failed to calculate expiration")?
        .timestamp();

    let claims = Claims {
        sub: user_id,
        username: username.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(JWT_SECRET.as_bytes()),
    )
    .map_err(|e| format!("Failed to generate token: {}", e))
}

pub fn verify_token(token: &str) -> Result<Claims, String> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(JWT_SECRET.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|e| format!("Invalid token: {}", e))
}
