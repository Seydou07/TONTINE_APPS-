# 🟢 Venega

**Vẽenega** — « Ce qui est clair » (Mooré, Burkina Faso)

Plateforme de gestion financière communautaire qui digitalise la **tontine rotative** (ROSCA) et la **caisse de solidarité** en Afrique de l'Ouest.

## Structure du Monorepo

```
venega/
├── apps/
│   ├── mobile/          → React Native (Expo + Expo Router)
│   ├── web/             → Next.js 14+ (App Router) — vitrine + espace membre
│   └── backoffice/      → Next.js 14+ — outil d'administration interne
├── packages/
│   ├── design-tokens/   → Couleurs, typo, spacing (CSS + Tailwind + JS natif)
│   ├── ui/              → Composants web partagés (shadcn/ui personnalisés)
│   ├── ui-native/       → Composants mobile partagés
│   ├── config/          → ESLint, TSConfig, Prettier partagés
│   └── types/           → Types TypeScript partagés (DTOs, enums, mocks)
```

## Stack Technique

| Couche | Technologie |
|--------|------------|
| Mobile | React Native + Expo (SDK 52+), Expo Router, NativeWind, Reanimated 3 |
| Web | Next.js 14+ (App Router), TailwindCSS, shadcn/ui, Framer Motion |
| Backoffice | Next.js 14+ (App Router), TailwindCSS, shadcn/ui, Recharts |
| Types | TypeScript strict, Zod validation |
| Monorepo | pnpm workspaces + Turborepo |

## Commandes

```bash
# Installation
pnpm install

# Développement (toutes les apps)
pnpm dev

# Développement (une app spécifique)
pnpm dev --filter web
pnpm dev --filter mobile
pnpm dev --filter backoffice

# Build
pnpm build

# Lint + TypeCheck
pnpm lint
pnpm typecheck
```

## Marché Cible

🇧🇫 **Burkina Faso** — Devise : XOF (F CFA)  
💳 Paiement : **CinetPay** (Orange Money / Moov Money)

---

*Développé par Aniss Informatique*
