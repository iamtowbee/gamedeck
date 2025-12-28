mod db;
mod handlers;
mod models;
mod services;

use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "GameDeck API",
        "version": "1.0.0"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:gamedeck.db".to_string());
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    log::info!("Connecting to database: {}", database_url);

    // Create database pool
    let pool = db::create_pool(&database_url)
        .await
        .expect("Failed to create database pool");

    // Run migrations
    log::info!("Running database migrations...");
    db::run_migrations(&pool)
        .await
        .expect("Failed to run migrations");

    log::info!("Starting server at http://{}:{}", host, port);

    // Start HTTP server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .wrap(Logger::default())
            .wrap(cors)
            .route("/health", web::get().to(health_check))
            .configure(handlers::auth::configure)
            .configure(handlers::games::configure)
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}
