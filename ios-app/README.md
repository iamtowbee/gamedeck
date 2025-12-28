# GameDeck iOS - XMB Style Daily Game Menu

A Sony PlayStation XrossMediaBar (XMB) inspired iOS app for discovering and tracking daily games.

## 🎮 Features

- **XMB-Style Interface**: Beautiful PlayStation-inspired menu with smooth animations
- **Daily Game Tracking**: Track which games you play each day
- **Streak Counter**: Keep your daily gaming streak alive
- **5 Game Categories**:
  - 🎯 Daily Pick - A curated game picked just for you each day
  - 🔥 Trending Now - Popular games right now
  - ✨ New Releases - Recently released games
  - ⭐ Top Rated - Highest rated games
  - 📜 My History - Your play history

- **Swipe Gestures**: Intuitive swipe navigation
  - Swipe left/right to change categories
  - Swipe up/down to browse games
  - Tap to mark a game as played

- **Stats Tracking**:
  - Current streak (consecutive days played)
  - Total games played
  - Games played today

## 📱 Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## 🚀 Setup Instructions

### 1. Create Xcode Project

1. Open Xcode
2. Create a new iOS App project
3. Name it "GameDeck"
4. Select SwiftUI as the interface
5. Select Swift as the language

### 2. Add Source Files

Copy all files from this directory into your Xcode project:

```
GameDeck/
├── GameDeckApp.swift          (Main app entry)
├── Models/
│   └── Game.swift             (Data models)
├── Services/
│   ├── GameAPIClient.swift    (API client)
│   └── DailyGameStorage.swift (Local storage)
├── ViewModels/
│   └── XMBMenuViewModel.swift (Menu logic)
└── Views/
    ├── XMBMenuView.swift             (Main menu view)
    └── XMBMenuWithGesturesView.swift (Gesture-enabled menu)
```

### 3. Get RAWG API Key

1. Visit https://rawg.io/apidocs
2. Create a free account
3. Get your API key
4. Open `Services/GameAPIClient.swift`
5. Replace `YOUR_API_KEY_HERE` with your actual API key:

```swift
private let apiKey = "your-actual-api-key"
```

### 4. Configure Info.plist

Add the following to allow HTTP requests to the RAWG API:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

**Note**: For production, use `NSExceptionDomains` instead of allowing arbitrary loads.

### 5. Build and Run

1. Select your target device or simulator
2. Press Cmd + R to build and run
3. Enjoy your XMB-style game menu!

## 🎯 How to Use

### Navigation

- **Swipe Left/Right**: Change category (Daily Pick → Trending → New → Top Rated → History)
- **Swipe Up/Down**: Browse games within current category
- **Tap on Game**: Mark game as played for today

### Stats

- **Streak**: Number of consecutive days you've played games
- **Total**: Total number of games you've played
- **Today**: Number of games played today

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     XMBMenuWithGesturesView         │ (UI Layer)
│  - Handles user gestures            │
│  - Displays XMB interface           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      XMBMenuViewModel               │ (Business Logic)
│  - Manages menu state               │
│  - Coordinates data flow            │
└──────┬───────────────────┬──────────┘
       │                   │
┌──────▼──────────┐   ┌───▼────────────────┐
│ GameAPIClient   │   │ DailyGameStorage   │ (Data Layer)
│ - Fetches games │   │ - Tracks plays     │
│ - RAWG API      │   │ - UserDefaults     │
└─────────────────┘   └────────────────────┘
```

## 🎨 Customization

### Change Category Colors

Edit `Models/Game.swift`:

```swift
static let categories: [MenuCategory] = [
    MenuCategory(id: "daily", title: "Daily Pick", color: "#YourColor"),
    // ...
]
```

### Adjust Animation Speed

In `XMBMenuWithGesturesView.swift`, modify the spring animation:

```swift
.animation(.spring(response: 0.3), value: viewModel.categoryIndex)
//                    ^^^^ Change this value
```

### Modify Swipe Sensitivity

In `handleSwipe()` method, adjust the threshold values:

```swift
if horizontalAmount > 50 {  // Change 50 to your preferred value
    // ...
}
```

## 📦 Dependencies

This project uses only native iOS frameworks:
- SwiftUI (UI)
- Foundation (Data)
- Combine (Reactive programming)

No external dependencies required! 🎉

## 🐛 Troubleshooting

### "No games loading"

- Check your API key in `GameAPIClient.swift`
- Verify internet connection
- Check console for error messages

### "Swipes not working"

- Make sure you're using `XMBMenuWithGesturesView` not `XMBMenuView`
- Test on a physical device (gestures work better than simulator)

### "Stats not persisting"

- UserDefaults is used for storage
- Data persists between app launches
- Deleting the app will clear all data

## 🚀 Future Enhancements

Potential features to add:

- [ ] iCloud sync for cross-device tracking
- [ ] Game details page with screenshots
- [ ] Achievements and badges
- [ ] Share your streak on social media
- [ ] Widget for daily game pick
- [ ] Dark/Light mode toggle
- [ ] Custom category creation
- [ ] Export play history

## 📝 License

This is a demo project. Feel free to use and modify as needed!

## 🙏 Credits

- Game data powered by [RAWG API](https://rawg.io)
- Inspired by Sony PlayStation XMB interface
- Built with ❤️ using SwiftUI
