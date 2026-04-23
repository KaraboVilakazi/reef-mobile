# Reef Mobile 📱

React Native companion app for the [Reef](https://github.com/KaraboVilakazi/reef) personal finance platform, built with **Expo SDK 54**.

## Stack

| Layer | Tech |
|---|---|
| Framework | React Native · Expo SDK 54 |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| Auth | JWT via shared API |

## Features

- **Dashboard** — account balances and recent transaction overview
- **Accounts** — view and manage multiple accounts
- **Transactions** — full transaction history with filtering
- **Budgets** — track monthly budget usage per category
- **Auth** — login and registration with JWT session management

## Project Structure

```
reef-mobile/
├── app/
│   ├── (auth)/        # Login & Register screens
│   ├── (tabs)/        # Dashboard, Accounts, Transactions, Budgets, Profile
│   └── _layout.tsx    # Root layout with auth guard
├── src/
│   ├── components/ui/ # Button, Input, Badge, Skeleton
│   ├── context/       # AuthContext
│   ├── services/      # API client
│   ├── theme/         # Design tokens
│   └── types/         # API type definitions
└── assets/            # Icons and splash screen
```

## Getting Started

### Prerequisites
- Node.js 20+
- [Reef API](https://github.com/KaraboVilakazi/reef) running locally
- Expo Go app (iOS/Android) — or a local iOS/Android simulator

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Related

- **API + Web:** [reef](https://github.com/KaraboVilakazi/reef) — C# / .NET 8 backend with Angular 19 frontend
