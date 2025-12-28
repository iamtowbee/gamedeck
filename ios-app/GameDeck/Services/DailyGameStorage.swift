import Foundation

class DailyGameStorage {
    static let shared = DailyGameStorage()
    private let storageKey = "gamedeck_daily_history"

    private init() {}

    // MARK: - Storage Operations

    func getDailyGameHistory() -> [String: [DailyGameEntry]] {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let history = try? JSONDecoder().decode([String: [DailyGameEntry]].self, from: data) else {
            return [:]
        }
        return history
    }

    func getTodayDate() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    func getTodayGames() -> [DailyGameEntry] {
        let history = getDailyGameHistory()
        let today = getTodayDate()
        return history[today] ?? []
    }

    func addGameToToday(gameId: Int, gameName: String) {
        var history = getDailyGameHistory()
        let today = getTodayDate()
        var todayGames = history[today] ?? []

        // Check if game already played today
        if todayGames.contains(where: { $0.gameId == gameId }) {
            return
        }

        let newEntry = DailyGameEntry(
            gameId: gameId,
            gameName: gameName,
            playedDate: Date(),
            completed: false
        )

        todayGames.append(newEntry)
        history[today] = todayGames
        saveHistory(history)
    }

    func markGameAsCompleted(gameId: Int) {
        var history = getDailyGameHistory()
        let today = getTodayDate()
        guard var todayGames = history[today] else { return }

        if let index = todayGames.firstIndex(where: { $0.gameId == gameId }) {
            todayGames[index].completed = true
            history[today] = todayGames
            saveHistory(history)
        }
    }

    func getPlayedGamesCount() -> Int {
        let history = getDailyGameHistory()
        return history.values.reduce(0) { $0 + $1.count }
    }

    func getStreakDays() -> Int {
        let history = getDailyGameHistory()
        let sortedDates = history.keys.sorted(by: >)

        var streak = 0
        var currentDate = Date()
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        for dateStr in sortedDates {
            let checkDate = formatter.string(from: currentDate)
            if dateStr == checkDate {
                streak += 1
                currentDate = calendar.date(byAdding: .day, value: -1, to: currentDate) ?? currentDate
            } else {
                break
            }
        }

        return streak
    }

    private func saveHistory(_ history: [String: [DailyGameEntry]]) {
        if let encoded = try? JSONEncoder().encode(history) {
            UserDefaults.standard.set(encoded, forKey: storageKey)
        }
    }
}
