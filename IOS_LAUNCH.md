# 🍎 iOS App Store Launch Guide

This guide walks you through the final steps to publish **Weepaa Truck GPS** to the Apple App Store.

## ✅ Prerequisites

- **Mac Computer** with macOS.
- **Xcode** installed (from the Mac App Store).
- **Apple Developer Account** ($99/year).

## 🚀 Step 1: Open the Project in Xcode

1.  Open your terminal in the project folder.
2.  Run the following command to open the native iOS project:
    ```bash
    npx cap open ios
    ```
    *This will launch Xcode.*

## ⚙️ Step 2: Configure Signing & Capabilities

1.  In Xcode, click on **"App"** in the left project navigator (the blue icon at the top).
2.  Select the **"App"** target in the main window.
3.  Go to the **"Signing & Capabilities"** tab.
4.  **Team**: Select your Apple Developer Team.
    - *If none appears, click "Add an Account" and log in with your Apple ID.*
5.  **Bundle Identifier**: Ensure it is `com.weepaa.gps` (or your unique ID).

## 📱 Step 3: Set App Icons and Splash Screen

1.  In the project navigator, go to `App` -> `App` -> `Assets`.
2.  Drag and drop your app icon (1024x1024) into the **AppIcon** slot.
3.  Capacitor automatically handles the splash screen, but you can customize it in `LaunchScreen.storyboard`.

## 📦 Step 4: Archive and Upload

1.  Connect a real iOS device (iPhone/iPad) or select "Any iOS Device (arm64)" from the device selector at the top.
2.  Go to **Product** -> **Archive** in the top menu.
3.  Wait for the build to complete.
4.  Once the "Organizer" window opens, select your build and click **"Distribute App"**.
5.  Select **"App Store Connect"** -> **"Upload"**.
6.  Follow the prompts to upload your binary.

## 🌐 Step 5: App Store Connect

1.  Go to [App Store Connect](https://appstoreconnect.apple.com).
2.  Go to **"My Apps"** and create a new app (if not already created).
3.  Fill in the metadata:
    - **Name**: Weepaa Truck GPS
    - **Description**: Professional navigation for truckers...
    - **Keywords**: truck, gps, navigation, weigh station, diesel
    - **Screenshots**: Upload screenshots from your device/simulator.
4.  Select the build you just uploaded in Xcode.
5.  Click **"Submit for Review"**.

---
*Good luck with your launch! 🚛*
