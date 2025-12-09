# Weepaa Truck GPS 🚛🌍

**The "Waze for Trucks"** - A next-generation navigation app designed specifically for commercial drivers. Weepaa combines professional truck routing with community-driven real-time reporting to save you time, money, and stress.

![Weepaa GPS](https://via.placeholder.com/800x400?text=Weepaa+Truck+GPS+Preview)

## 🚀 Key Features

### 🗺️ Professional Truck Navigation
- **Height/Weight Routing**: Avoids low bridges and weight-restricted roads based on your vehicle profile.
- **Hazmat Support**: Safe routing for hazardous materials.
- **Weigh Station Avoidance**: (Premium) Smart detours to bypass open scales.

### 📢 Community & Social (The "Waze" Effect)
- **Real-Time Reporting**: Report Police, Accidents, Hazards, and Parking availability.
- **Verification System**: "Is it still there?" voting keeps data fresh.
- **Gamification**: Earn points, climb the leaderboard, and unlock "Legend" status.

### 🛠️ Essential Tools
- **Offline Mode**: Works even when you lose signal.
- **Fuel Finder**: Locate the cheapest diesel along your route.
- **Weather Alerts**: Heads-up warnings for severe weather ahead.

## 💻 Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Maps**: Leaflet, React-Leaflet, OSRM (Open Source Routing Machine)
- **Backend**: Firebase (Auth, Firestore)
- **PWA**: Vite PWA Plugin (Offline capabilities)

## 🛠️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/weepaa-gps.git
    cd weepaa-gps
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory (copy `.env.example`):
    ```bash
    cp .env.example .env
    ```
    Add your Firebase API keys:
    ```env
    VITE_FIREBASE_API_KEY=your_key
    VITE_FIREBASE_AUTH_DOMAIN=your_domain
    ...
    ```
    > **Note**: If you don't have keys, the app will run in **Mock Mode**, using LocalStorage for data.

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## 📲 How to Install (PWA)

Weepaa Truck GPS is a Progressive Web App (PWA). You can install it directly from your browser without visiting an app store.

### iOS (iPhone/iPad)
1.  Open the app in **Safari**.
2.  Tap the **Share** button (square with arrow).
3.  Scroll down and tap **"Add to Home Screen"**.

### Android
1.  Open the app in **Chrome**.
2.  Tap the menu (three dots).
3.  Tap **"Install App"** or **"Add to Home Screen"**.

### Desktop (Chrome/Edge)
1.  Look for the **Install icon** in the address bar (right side).
2.  Click it and select **Install**.

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add your Environment Variables in the Vercel dashboard.
4.  Deploy!

## 🤝 Contributing

We welcome contributions from the trucking and dev community! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT License. Drive safe! 🚚
