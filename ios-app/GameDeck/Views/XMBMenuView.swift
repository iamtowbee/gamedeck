import SwiftUI

struct XMBMenuView: View {
    @StateObject private var viewModel = XMBMenuViewModel()

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(hex: "#1a1a2e"),
                    Color(hex: "#16213e")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // Background image with blur
            if let game = viewModel.getCurrentGame() {
                BackgroundImageView(imageURL: game.backgroundImage)
            }

            VStack {
                // Stats bar
                StatsBar(
                    streak: viewModel.streakDays,
                    total: viewModel.totalGamesPlayed,
                    today: viewModel.todayCount
                )
                .padding(.top, 50)

                Spacer()

                if viewModel.isLoading {
                    LoadingView()
                } else {
                    // Category navigation
                    CategoryNavigationView(
                        categories: viewModel.categories,
                        selectedIndex: viewModel.categoryIndex
                    )
                    .padding(.bottom, 40)

                    // Game carousel
                    if let game = viewModel.getCurrentGame() {
                        GameCardView(
                            game: game,
                            categoryColor: viewModel.categories[viewModel.categoryIndex].color,
                            isPlayed: viewModel.isGamePlayed(game.id)
                        )
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal: .move(edge: .leading).combined(with: .opacity)
                        ))
                        .id(game.id)
                    }

                    // Game indicator dots
                    GameIndicatorView(
                        totalGames: viewModel.getCurrentGames().count,
                        currentIndex: viewModel.gameIndex,
                        color: viewModel.categories[viewModel.categoryIndex].color
                    )
                    .padding(.top, 20)
                }

                Spacer()

                // Navigation hints
                NavigationHintsView()
                    .padding(.bottom, 30)
            }
        }
        .onAppear {
            setupGestures()
        }
    }

    private func setupGestures() {
        // Swipe gestures are handled in the view modifiers below
    }
}

// MARK: - Background Image View
struct BackgroundImageView: View {
    let imageURL: String?

    var body: some View {
        if let urlString = imageURL, let url = URL(string: urlString) {
            AsyncImage(url: url) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .blur(radius: 30)
                    .opacity(0.3)
            } placeholder: {
                Color.clear
            }
            .ignoresSafeArea()
            .overlay(
                LinearGradient(
                    colors: [
                        Color(hex: "#1a1a2e").opacity(0.8),
                        Color(hex: "#16213e").opacity(0.9)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        }
    }
}

// MARK: - Stats Bar
struct StatsBar: View {
    let streak: Int
    let total: Int
    let today: Int

    var body: some View {
        HStack(spacing: 30) {
            StatItem(label: "STREAK", value: "\(streak)", color: "#00A8E1")
            StatItem(label: "TOTAL", value: "\(total)", color: "#FFD700")
            StatItem(label: "TODAY", value: "\(today)", color: "#4ECDC4")
        }
        .padding(.horizontal, 30)
        .padding(.vertical, 15)
        .background(.ultraThinMaterial)
        .cornerRadius(12)
        .padding(.horizontal, 20)
    }
}

struct StatItem: View {
    let label: String
    let value: String
    let color: String

    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.gray)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(Color(hex: color))
        }
    }
}

// MARK: - Category Navigation
struct CategoryNavigationView: View {
    let categories: [MenuCategory]
    let selectedIndex: Int

    var body: some View {
        HStack(spacing: 40) {
            ForEach(Array(categories.enumerated()), id: \.offset) { index, category in
                VStack(spacing: 8) {
                    Circle()
                        .fill(index == selectedIndex ? Color(hex: category.color) : Color.gray.opacity(0.3))
                        .frame(width: index == selectedIndex ? 60 : 50, height: index == selectedIndex ? 60 : 50)
                        .shadow(color: index == selectedIndex ? Color(hex: category.color).opacity(0.6) : .clear, radius: 20)

                    Text(category.title)
                        .font(.caption)
                        .fontWeight(index == selectedIndex ? .bold : .regular)
                        .foregroundColor(index == selectedIndex ? .white : .gray)
                }
                .scaleEffect(index == selectedIndex ? 1.1 : 1.0)
                .animation(.spring(response: 0.3), value: selectedIndex)
            }
        }
    }
}

// MARK: - Game Card
struct GameCardView: View {
    let game: Game
    let categoryColor: String
    let isPlayed: Bool

    var body: some View {
        VStack(spacing: 20) {
            // Game image
            ZStack(alignment: .topTrailing) {
                if let urlString = game.backgroundImage, let url = URL(string: urlString) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                    }
                } else {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                }

                if isPlayed {
                    Text("✓ PLAYED")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.green)
                        .cornerRadius(8)
                        .padding(12)
                }
            }
            .frame(width: 350, height: 250)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color(hex: categoryColor), lineWidth: 4)
            )
            .shadow(color: .black.opacity(0.5), radius: 20)

            // Game info
            VStack(spacing: 8) {
                Text(game.name)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)

                if let metacritic = game.metacritic {
                    Text("\(metacritic)")
                        .font(.callout)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(metacritic > 80 ? Color.green : Color.yellow)
                        .cornerRadius(8)
                }

                Text("Tap to mark as played • Swipe to navigate")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .frame(maxWidth: 350)
        }
        .padding()
    }
}

// MARK: - Game Indicator
struct GameIndicatorView: View {
    let totalGames: Int
    let currentIndex: Int
    let color: String

    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<totalGames, id: \.self) { index in
                Capsule()
                    .fill(index == currentIndex ? Color(hex: color) : Color.gray.opacity(0.3))
                    .frame(width: index == currentIndex ? 24 : 8, height: 8)
                    .animation(.spring(response: 0.3), value: currentIndex)
            }
        }
    }
}

// MARK: - Navigation Hints
struct NavigationHintsView: View {
    var body: some View {
        HStack(spacing: 30) {
            Text("← → Category")
            Text("↑ ↓ Game")
            Text("TAP Select")
        }
        .font(.caption)
        .foregroundColor(.gray)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(.ultraThinMaterial)
        .cornerRadius(8)
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        VStack {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                .scaleEffect(1.5)
            Text("Loading...")
                .font(.title3)
                .foregroundColor(.white)
                .padding(.top, 20)
        }
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    XMBMenuView()
}
