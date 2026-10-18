# ⚡ Calculator — Modern, Minimal & Scientific for Android

<p align="center">
  <img src="public/icon-192.png" alt="Calculator Logo" width="120" style="border-radius: 28px;" />
</p>

<p align="center">
  <strong>A high-precision, minimalist Android Calculator, Live Currency & Unit Converter, and Bill Splitter.</strong>
  <br />
  Built with <strong>Ionic React</strong>, <strong>Capacitor 8</strong>, and <strong>TypeScript</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Platform Android" />
  <img src="https://img.shields.io/badge/Ionic-Framework%209-3880FF?style=for-the-badge&logo=ionic&logoColor=white" alt="Ionic Framework" />
  <img src="https://img.shields.io/badge/Capacitor-8.0-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## ✨ Features

### 1. 🧮 Dual-Mode Calculator (Basic & Scientific)
- **Basic Mode**: Ultra-fast daily calculations with an intuitive 4×5 keypad.
- **Scientific Mode**: Unified 5×7 grid with zero vertical scrolling across all screen sizes.
  - Trigonometry: `sin`, `cos`, `tan` with **DEG**, **RAD**, and **GRAD** angle modes.
  - Hyperbolic functions: `sinh`, `cosh`, `tanh`, and inverses via the `2nd` key.
  - Advanced Math: Powers ($x^y$, $x^2$, $x^3$), roots ($\sqrt{x}$, $\sqrt[3]{x}$), factorials ($n!$), logarithms ($\ln$, $\log_{10}$), constants ($\pi$, $e$), and random generator.
  - Memory Registers: Dedicated `MC`, `MR`, `M+`, `M-`, `MS` controls.
  - Real-Time Live Preview: Instant syntax-validated calculation preview before pressing `=`.
  - Calculation History: Full timeline with tap-to-reuse and clipboard copy.

### 2. 💱 Live Multi-Currency Converter
- **Default Currency**: Indian Rupee (**INR / ₹**).
- **Live Real-Time Rates**: Fetches live exchange rates automatically with offline caching and background synchronization.
- **Supported Global Currencies**: INR (₹), USD ($), EUR (€), GBP (£), AED (د.إ), SAR (﷼), CAD (C$), AUD (A$), SGD (S$), JPY (¥), CNY (¥), KWD (KD), and more.
- **One-Tap Quick Swap**: Instant conversion inversion between currencies.

### 3. ⚖️ Multi-Category Unit Converter
- **9 Core Categories**: Currency, Length, Mass & Weight, Temperature, Area, Volume, Speed, Digital Storage, and Time.
- Dynamic numeric keypad for frictionless one-handed conversions.

### 4. 👥 Tip & Smart Bill Splitter
- Multi-currency bill splitting default to Indian Rupee (₹).
- Split between 1 to 50 people with live per-person breakdown.
- Preset tip chips (0%, 5%, 10%, 15%, 20%) with zero dummy data on startup.

---

## 🎨 Design & Android Responsiveness

- **Zero-Scroll Guarantee**: Engineered with dynamic viewport-relative keypad sizing (`calc()`, dynamic row grids) so keys never overflow or scroll vertically on compact phones, tall 20:9 screens, tablets, or foldables.
- **Minimalist Aesthetic**: Dark titanium slate palette (`#07090e`), custom matching minimalist app icon, and unified native splash screen.
- **Native Android Feel**: Integrated `@capacitor/haptics` tactile vibration and low-latency audio feedback.

---

## 🚀 Download & Installation

### Option 1: Direct APK Download
Grab the latest APK directly from the [Releases](https://github.com/Sahildholpuria/Ionic-Framework-Project-s/releases) page:
1. Download `app-debug.apk`.
2. Open the file on your Android device and tap **Install**.

### Option 2: Build from Source

#### Prerequisites
- Node.js (v18+) & npm
- Android Studio with Android SDK (API 34+)
- Java JDK 21

```bash
# 1. Clone the repository
git clone https://github.com/Sahildholpuria/Ionic-Framework-Project-s.git
cd Ionic-Framework-Project-s

# 2. Install dependencies
npm install

# 3. Build web bundle & sync native Capacitor assets
npm run build
npx cap sync android

# 4. Run on Android Device / Emulator
npx cap open android
```

Or build APK directly via Gradle:
```bash
cd android
./gradlew assembleDebug
# Output binary generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 Testing

Run the automated Vitest test suite:
```bash
npm run test.unit -- --run
```

---

## 📄 License

Distributed under the MIT License.
