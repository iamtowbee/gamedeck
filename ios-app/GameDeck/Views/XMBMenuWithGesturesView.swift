import SwiftUI

struct XMBMenuWithGesturesView: View {
    @StateObject private var viewModel = XMBMenuViewModel()
    @State private var dragOffset: CGSize = .zero

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

                    // Game carousel with gestures
                    if let game = viewModel.getCurrentGame() {
                        GameCardView(
                            game: game,
                            categoryColor: viewModel.categories[viewModel.categoryIndex].color,
                            isPlayed: viewModel.isGamePlayed(game.id)
                        )
                        .offset(x: dragOffset.width, y: dragOffset.height)
                        .gesture(
                            DragGesture()
                                .onChanged { gesture in
                                    dragOffset = gesture.translation
                                }
                                .onEnded { gesture in
                                    handleSwipe(gesture: gesture)
                                    withAnimation(.spring(response: 0.3)) {
                                        dragOffset = .zero
                                    }
                                }
                        )
                        .onTapGesture {
                            withAnimation {
                                viewModel.selectCurrentGame()
                            }
                        }
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
    }

    private func handleSwipe(gesture: DragGesture.Value) {
        let horizontalAmount = gesture.translation.width
        let verticalAmount = gesture.translation.height

        if abs(horizontalAmount) > abs(verticalAmount) {
            // Horizontal swipe - change category
            if horizontalAmount > 50 {
                withAnimation(.spring(response: 0.3)) {
                    viewModel.moveToCategory(-1) // Swipe right = previous category
                }
            } else if horizontalAmount < -50 {
                withAnimation(.spring(response: 0.3)) {
                    viewModel.moveToCategory(1) // Swipe left = next category
                }
            }
        } else {
            // Vertical swipe - change game
            if verticalAmount > 50 {
                withAnimation(.spring(response: 0.3)) {
                    viewModel.moveToGame(-1) // Swipe down = previous game
                }
            } else if verticalAmount < -50 {
                withAnimation(.spring(response: 0.3)) {
                    viewModel.moveToGame(1) // Swipe up = next game
                }
            }
        }
    }
}

#Preview {
    XMBMenuWithGesturesView()
}
