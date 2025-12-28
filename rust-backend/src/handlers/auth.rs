use actix_web::{web, HttpResponse, Responder};
use crate::db::DbPool;
use crate::models::{LoginUser, RegisterUser};
use crate::services::auth::{login_user, register_user};

pub async fn register(
    pool: web::Data<DbPool>,
    user_data: web::Json<RegisterUser>,
) -> impl Responder {
    match register_user(pool.get_ref(), user_data.into_inner()).await {
        Ok(response) => HttpResponse::Created().json(response),
        Err(err) => HttpResponse::BadRequest().json(serde_json::json!({
            "error": err
        })),
    }
}

pub async fn login(pool: web::Data<DbPool>, login_data: web::Json<LoginUser>) -> impl Responder {
    match login_user(pool.get_ref(), login_data.into_inner()).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(err) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": err
        })),
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/register", web::post().to(register))
            .route("/login", web::post().to(login)),
    );
}
