# QuickSend Web

A modern fintech web application for managing multi-currency crypto wallets, transfers, and compliance.

## Overview

QuickSend Web is a React-based single-page application that provides a complete digital wallet experience. Users can deposit and withdraw USDT across multiple networks (TRC-20, ERC-20, SOL, MATIC), send money to beneficiaries, track payouts in real time, and manage KYC/compliance requirements.

## Tech Stack

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter)](https://reactrouter.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-000000)](https://github.com/pmndrs/zustand)
[![Axios](https://img.shields.io/badge/Axios-1-5A29E4?logo=axios)](https://axios-http.com)

## Features

| Feature | Description |
|---|---|
| **Authentication** | Login, registration, phone verification, MFA (SMS/authenticator) |
| **Wallet** | Multi-network wallet with deposit (QR code), withdraw, and transaction history |
| **Transfers** | Send money to beneficiaries with live exchange rate quotes |
| **Beneficiaries** | Save and manage frequently used recipients |
| **Payout Tracking** | Real-time status monitoring for outgoing payments |
| **Compliance & KYC** | Tier-based identity verification and document upload |
| **Notifications** | In-app notification center for alerts and updates |
| **Profile** | Onboarding flow with personal details setup |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://your-api-url.com/api/v1
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output is written to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── api/              # Axios client & interceptors
├── assets/           # Static assets (images, icons)
├── components/       # Reusable UI components
│   ├── feature/      # Feature-specific components
│   ├── guards/       # Route guards (ProtectedRoute, PublicRoute)
│   ├── layout/       # App shell layouts
│   ├── notifications/# Notification UI
│   └── ui/           # Primitive components (Button, Input, Card, etc.)
├── config/           # App configuration & env vars
├── features/         # Domain modules
│   ├── auth/         # Auth store, API, types
│   ├── wallet/       # Wallet store, service, API, types
│   ├── transfers/    # Transfer & quote API, store, types
│   ├── beneficiaries/# Beneficiary API, store, types
│   ├── payout/       # Payout API, store, types
│   ├── compliance/   # Compliance API, store, types
│   └── notifications/# Notification API, store, types
├── hooks/            # Shared React hooks
├── pages/            # Route-level components
├── routes/           # Route definitions (public + protected)
├── services/         # Shared services
├── store/            # Global stores
├── styles/           # Additional style files
├── types/            # Shared TypeScript types
└── utils/            # Utility functions
```

## Deployment

The app is built as a static SPA and can be served behind any web server. An `nginx.conf` is included for Nginx deployments — it ensures all routes fall back to `index.html` for client-side routing.

## License

MIT
