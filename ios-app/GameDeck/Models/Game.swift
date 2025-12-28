import Foundation

struct Game: Codable, Identifiable {
    let id: Int
    let name: String
    let backgroundImage: String?
    let metacritic: Int?
    let released: String?
    let rating: Double?

    enum CodingKeys: String, CodingKey {
        case id, name, metacritic, released, rating
        case backgroundImage = "background_image"
    }
}

struct GamesResponse: Codable {
    let count: Int
    let results: [Game]
}

struct MenuCategory {
    let id: String
    let title: String
    let color: String

    static let categories: [MenuCategory] = [
        MenuCategory(id: "daily", title: "Daily Pick", color: "#00A8E1"),
        MenuCategory(id: "trending", title: "Trending Now", color: "#FF6B35"),
        MenuCategory(id: "new", title: "New Releases", color: "#4ECDC4"),
        MenuCategory(id: "top", title: "Top Rated", color: "#FFD700"),
        MenuCategory(id: "played", title: "My History", color: "#9B59B6")
    ]
}

struct DailyGameEntry: Codable {
    let gameId: Int
    let gameName: String
    let playedDate: Date
    var completed: Bool
}
