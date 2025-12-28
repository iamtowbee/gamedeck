use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::db::DbPool;
use crate::models::{CreateGameEntry, UpdateGameEntry};
use crate::services::{
    game_tracking::{
        add_game_entry, delete_game_entry, get_game_stats, get_today_games, get_user_games,
        update_game_entry,
    },
    auth::verify_token,
};

fn extract_user_id(req: &HttpRequest) -> Result<i64, HttpResponse> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| {
            HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Missing authorization header"
            }))
        })?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| {
            HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "Invalid authorization header format"
            }))
        })?;

    let claims = verify_token(token).map_err(|err| {
        HttpResponse::Unauthorized().json(serde_json::json!({
            "error": err
        }))
    })?;

    Ok(claims.sub)
}

pub async fn add_game(
    req: HttpRequest,
    pool: web::Data<DbPool>,
    entry_data: web::Json<CreateGameEntry>,
) -> impl Responder {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };

    match add_game_entry(pool.get_ref(), user_id, entry_data.into_inner()).await {
        Ok(entry) => HttpResponse::Created().json(entry),
        Err(err) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": err
        })),
    }
}

pub async fn get_games(req: HttpRequest, pool: web::Data<DbPool>) -> impl Responder {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };

    match get_user_games(pool.get_ref(), user_id).await {
        Ok(entries) => HttpResponse::Ok().json(entries),
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err
        })),
    }
}

pub async fn get_today(req: HttpRequest, pool: web::Data<DbPool>) -> impl Responder {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };

    match get_today_games(pool.get_ref(), user_id).await {
        Ok(entries) => HttpResponse::Ok().json(entries),
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err
        })),
    }
}

pub async fn update_game(
    req: HttpRequest,
    pool: web::Data<DbPool>,
    entry_id: web::Path<i64>,
    update_data: web::Json<UpdateGameEntry>,
) -> impl Responder {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };

    match update_game_entry(pool.get_ref(), user_id, *entry_id, update_data.into_inner()).await {
        Ok(entry) => HttpResponse::Ok().json(entry),
        Err(err) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": err
        })),
    }
}

pub async fn delete_game(
    req: HttpRequest,
    pool: web::Data<DbPool>,
    entry_id: web::Path<i64>,
) -> impl Responder {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };

    match delete_game_entry(pool.get_ref(), user_id, *entry_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": err
        })),
    }
}

pub async fn get_stats(req: HttpRequest, pool: web::Data<DbPool>) -> impl Responder {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(response) => return response,
    };

    match get_game_stats(pool.get_ref(), user_id).await {
        Ok(stats) => HttpResponse::Ok().json(stats),
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err
        })),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/games")
            .route("", web::post().to(add_game))
            .route("", web::get().to(get_games))
            .route("/today", web::get().to(get_today))
            .route("/stats", web::get().to(get_stats))
            .route("/{id}", web::put().to(update_game))
            .route("/{id}", web::delete().to(delete_game)),
    );
}
