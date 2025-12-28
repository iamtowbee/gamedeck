# GameDeck Rust Backend API

A high-performance Rust backend for the GameDeck app, providing user authentication, game tracking, cloud sync, and analytics.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication
- **Game Tracking**: Track games played daily with completion status
- **Cloud Sync**: Sync game history across devices
- **Analytics**: Streak tracking, stats, and play history
- **RESTful API**: Clean REST endpoints with JSON responses
- **SQLite/PostgreSQL**: Flexible database support
- **CORS Enabled**: Ready for web and mobile clients

## 🛠️ Tech Stack

- **Framework**: Actix-web 4.4 (Fast, async web framework)
- **Database**: SQLx with SQLite (PostgreSQL-ready)
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Serialization**: Serde
- **Async Runtime**: Tokio

## 📋 Prerequisites

- Rust 1.70+ (Install from https://rustup.rs/)
- SQLite3 (or PostgreSQL if preferred)

## 🔧 Installation

### 1. Clone and Navigate

```bash
cd rust-backend
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
DATABASE_URL=sqlite:gamedeck.db
HOST=127.0.0.1
PORT=8080
JWT_SECRET=your-super-secret-key-change-this
```

### 3. Build the Project

```bash
cargo build --release
```

### 4. Run the Server

```bash
cargo run --release
```

The server will start at `http://127.0.0.1:8080`

## 📡 API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "GameDeck API",
  "version": "1.0.0"
}
```

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com"
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "securepassword"
}
```

Response: Same as register

### Game Tracking (Requires Authentication)

**Note**: All game endpoints require `Authorization: Bearer {token}` header

#### Add Game Entry

```http
POST /games
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "game_id": 3498,
  "game_name": "Grand Theft Auto V",
  "completed": false
}
```

Response:
```json
{
  "id": 1,
  "user_id": 1,
  "game_id": 3498,
  "game_name": "Grand Theft Auto V",
  "played_date": "2025-12-28T10:30:00",
  "completed": false,
  "created_at": "2025-12-28T10:30:00"
}
```

#### Get All Games

```http
GET /games
Authorization: Bearer {your_jwt_token}
```

Response:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "game_id": 3498,
    "game_name": "Grand Theft Auto V",
    "played_date": "2025-12-28T10:30:00",
    "completed": false,
    "created_at": "2025-12-28T10:30:00"
  }
]
```

#### Get Today's Games

```http
GET /games/today
Authorization: Bearer {your_jwt_token}
```

Response: Array of game entries played today

#### Get Stats

```http
GET /games/stats
Authorization: Bearer {your_jwt_token}
```

Response:
```json
{
  "total_games": 42,
  "streak_days": 7,
  "today_count": 3,
  "games_by_day": [
    {
      "date": "2025-12-28",
      "count": 3
    },
    {
      "date": "2025-12-27",
      "count": 2
    }
  ]
}
```

#### Update Game Entry

```http
PUT /games/{id}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "completed": true
}
```

Response: Updated game entry

#### Delete Game Entry

```http
DELETE /games/{id}
Authorization: Bearer {your_jwt_token}
```

Response: 204 No Content

## 🏗️ Project Structure

```
rust-backend/
├── src/
│   ├── main.rs              # Application entry point
│   ├── db/
│   │   └── mod.rs           # Database connection & migrations
│   ├── models/
│   │   ├── mod.rs           # Module exports
│   │   ├── user.rs          # User models
│   │   └── game_entry.rs    # Game entry models
│   ├── services/
│   │   ├── mod.rs           # Module exports
│   │   ├── auth.rs          # Authentication logic
│   │   └── game_tracking.rs # Game tracking business logic
│   └── handlers/
│       ├── mod.rs           # Module exports
│       ├── auth.rs          # Auth HTTP handlers
│       └── games.rs         # Game HTTP handlers
├── Cargo.toml               # Dependencies
├── .env.example             # Environment template
└── README.md                # This file
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with default cost factor
- **JWT Tokens**: 7-day expiration, secure signing
- **CORS**: Configurable for production
- **SQL Injection Protection**: Using SQLx prepared statements
- **Authorization**: Token-based route protection

## 🚀 Deployment

### Production Build

```bash
cargo build --release
```

The optimized binary will be at `target/release/gamedeck-api`

### Environment Variables

Set these in production:

```bash
export DATABASE_URL="postgres://user:pass@localhost/gamedeck"
export HOST="0.0.0.0"
export PORT="8080"
export JWT_SECRET="your-production-secret-key"
export RUST_LOG="info"
```

### Run Production Server

```bash
./target/release/gamedeck-api
```

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libssl3 ca-certificates
COPY --from=builder /app/target/release/gamedeck-api /usr/local/bin/
CMD ["gamedeck-api"]
```

Build and run:

```bash
docker build -t gamedeck-api .
docker run -p 8080:8080 -e DATABASE_URL=sqlite:gamedeck.db gamedeck-api
```

## 🧪 Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:8080/health

# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Add game (replace TOKEN)
curl -X POST http://localhost:8080/games \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"game_id":3498,"game_name":"GTA V","completed":false}'

# Get stats
curl http://localhost:8080/games/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Game Entries Table

```sql
CREATE TABLE game_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    game_name TEXT NOT NULL,
    played_date DATETIME NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔄 Integrating with Clients

### React/TypeScript (Web)

```typescript
const API_URL = 'http://localhost:8080';

// Register
const response = await fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'player1',
    email: 'player1@example.com',
    password: 'password123'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);

// Add game
await fetch(`${API_URL}/games`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    game_id: 3498,
    game_name: 'GTA V',
    completed: false
  })
});
```

### Swift (iOS)

```swift
struct APIClient {
    let baseURL = "http://localhost:8080"
    var token: String?

    func addGame(gameId: Int, gameName: String) async throws {
        guard let token = token else { throw APIError.notAuthenticated }

        var request = URLRequest(url: URL(string: "\(baseURL)/games")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["game_id": gameId, "game_name": gameName, "completed": false]
        request.httpBody = try JSONEncoder().encode(body)

        let (_, response) = try await URLSession.shared.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 201 else {
            throw APIError.failed
        }
    }
}
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=8081
```

### Database Connection Failed

```bash
# Ensure SQLite file is writable
chmod 664 gamedeck.db

# Or use absolute path
DATABASE_URL=sqlite:/absolute/path/to/gamedeck.db
```

### CORS Issues

Update CORS configuration in `main.rs`:

```rust
let cors = Cors::default()
    .allowed_origin("http://localhost:3000")
    .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
    .allowed_headers(vec!["Authorization", "Content-Type"])
    .max_age(3600);
```

## 📈 Performance

- **Async/Await**: Non-blocking I/O with Tokio
- **Connection Pooling**: SQLx manages database connections
- **Release Builds**: Optimized for production performance
- **Memory Safety**: Rust's zero-cost abstractions

Expected performance:
- **Throughput**: ~50,000 requests/second (simple endpoints)
- **Latency**: <10ms average response time
- **Memory**: ~10-20MB footprint

## 🎯 Future Enhancements

- [ ] Redis caching for stats
- [ ] WebSocket support for real-time updates
- [ ] Rate limiting
- [ ] Prometheus metrics
- [ ] GraphQL API
- [ ] Social features (friends, leaderboards)
- [ ] Achievements system

## 📝 License

MIT License - Feel free to use in your projects!

## 🙏 Credits

- Built with Actix-web
- Database with SQLx
- Authentication with JWT
