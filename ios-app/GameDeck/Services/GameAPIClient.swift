import Foundation

class GameAPIClient {
    static let shared = GameAPIClient()
    private let baseURL = "https://api.rawg.io/api"
    private let apiKey = "YOUR_API_KEY_HERE" // Replace with your RAWG API key

    private init() {}

    func fetchDailyGames() async throws -> DailyCategoryGames {
        async let dailyGames = fetchGames(params: [
            "page_size": "20",
            "ordering": "-rating",
            "metacritic": "80,100"
        ])

        async let trendingGames = fetchGames(params: [
            "page_size": "15",
            "ordering": "-added"
        ])

        async let newGames = fetchGames(params: [
            "page_size": "15",
            "dates": "\(getDateMonthsAgo(1)),\(getTodayDate())",
            "ordering": "-released"
        ])

        async let topGames = fetchGames(params: [
            "page_size": "15",
            "ordering": "-metacritic",
            "metacritic": "85,100"
        ])

        let daily = try await dailyGames
        let trending = try await trendingGames
        let new = try await newGames
        let top = try await topGames

        // Pick a daily game based on today's date
        let dailyPick = daily.isEmpty ? [] : [daily[getDailyGameIndex(arrayLength: daily.count)]]

        return DailyCategoryGames(
            daily: dailyPick,
            trending: trending,
            new: new,
            top: top,
            played: []
        )
    }

    private func fetchGames(params: [String: String]) async throws -> [Game] {
        var components = URLComponents(string: "\(baseURL)/games")!
        var queryItems = params.map { URLQueryItem(name: $0.key, value: $0.value) }
        queryItems.append(URLQueryItem(name: "key", value: apiKey))
        components.queryItems = queryItems

        guard let url = components.url else {
            throw URLError(.badURL)
        }

        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(GamesResponse.self, from: data)
        return response.results
    }

    private func getTodayDate() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    private func getDateMonthsAgo(_ months: Int) -> String {
        let date = Calendar.current.date(byAdding: .month, value: -months, to: Date()) ?? Date()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    private func getDailyGameIndex(arrayLength: Int) -> Int {
        let today = getTodayDate()
        let seed = today.components(separatedBy: "-")
            .compactMap { Int($0) }
            .reduce(0, +)
        return seed % arrayLength
    }
}

struct DailyCategoryGames {
    var daily: [Game]
    var trending: [Game]
    var new: [Game]
    var top: [Game]
    var played: [Game]
}
