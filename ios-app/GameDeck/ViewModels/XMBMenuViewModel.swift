import Foundation
import Combine

@MainActor
class XMBMenuViewModel: ObservableObject {
    @Published var games: DailyCategoryGames = DailyCategoryGames(
        daily: [],
        trending: [],
        new: [],
        top: [],
        played: []
    )
    @Published var categoryIndex: Int = 0
    @Published var gameIndex: Int = 0
    @Published var isLoading: Bool = true
    @Published var playedToday: Set<Int> = []
    @Published var streakDays: Int = 0
    @Published var totalGamesPlayed: Int = 0
    @Published var todayCount: Int = 0

    private let storage = DailyGameStorage.shared
    private let apiClient = GameAPIClient.shared

    let categories = MenuCategory.categories

    init() {
        loadStats()
        Task {
            await loadGames()
        }
    }

    func loadGames() async {
        isLoading = true
        do {
            games = try await apiClient.fetchDailyGames()
            isLoading = false
        } catch {
            print("Error loading games: \(error)")
            isLoading = false
        }
    }

    func loadStats() {
        let todayGames = storage.getTodayGames()
        playedToday = Set(todayGames.map { $0.gameId })
        streakDays = storage.getStreakDays()
        totalGamesPlayed = storage.getPlayedGamesCount()
        todayCount = todayGames.count
    }

    func getCurrentGames() -> [Game] {
        let category = categories[categoryIndex]
        switch category.id {
        case "daily": return games.daily
        case "trending": return games.trending
        case "new": return games.new
        case "top": return games.top
        case "played": return games.played
        default: return []
        }
    }

    func getCurrentGame() -> Game? {
        let currentGames = getCurrentGames()
        guard !currentGames.isEmpty, gameIndex < currentGames.count else {
            return nil
        }
        return currentGames[gameIndex]
    }

    func moveToCategory(_ direction: Int) {
        let newIndex = categoryIndex + direction
        if newIndex >= 0 && newIndex < categories.count {
            categoryIndex = newIndex
            gameIndex = 0
        } else if newIndex < 0 {
            categoryIndex = categories.count - 1
            gameIndex = 0
        } else {
            categoryIndex = 0
            gameIndex = 0
        }
    }

    func moveToGame(_ direction: Int) {
        let currentGames = getCurrentGames()
        guard !currentGames.isEmpty else { return }

        let newIndex = gameIndex + direction
        if newIndex >= 0 && newIndex < currentGames.count {
            gameIndex = newIndex
        } else if newIndex < 0 {
            gameIndex = currentGames.count - 1
        } else {
            gameIndex = 0
        }
    }

    func selectCurrentGame() {
        guard let game = getCurrentGame() else { return }

        if !playedToday.contains(game.id) {
            storage.addGameToToday(gameId: game.id, gameName: game.name)
            playedToday.insert(game.id)
            loadStats()
        }
    }

    func isGamePlayed(_ gameId: Int) -> Bool {
        playedToday.contains(gameId)
    }
}
