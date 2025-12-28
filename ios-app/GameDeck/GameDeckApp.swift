import SwiftUI

@main
struct GameDeckApp: App {
    var body: some Scene {
        WindowGroup {
            XMBMenuWithGesturesView()
                .preferredColorScheme(.dark)
        }
    }
}
