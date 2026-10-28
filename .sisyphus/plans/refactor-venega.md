# Venega - Refactoring Summary

## Goal
Restructurer le monorepo Venega (tontine digitale/solidarité) en architecture feature-based pour mobile, web et backoffice — tout en préservant la qualité du code existant.

## Constraints & Preferences
- Ne PAS toucher `apps/api` (NestJS backend) — le collaborateur gère ça
- Ne jamais casser la qualité/professionalisme du code existant
- Toutes les routes dans `app/` doivent être des wrappers fins (réexport de 2 lignes)
- Structure de dossiers feature-based: `features/<name>/screens/`, `features/<name>/components/`
- Design tokens depuis `@venega/design-tokens` — pas de couleurs/tailles/rayons hardcodés
- Import standardisé: `colors`, `spacing`, `radius` depuis `@venega/design-tokens` (PAS l'import cassé `designTokens`)
- Marque: Venega — Burkina Faso, XOF, CinetPay, React Native Expo + Next.js + pnpm monorepo
- Typographie: police système (Roboto / SF Pro) via `typography` de `@venega/design-tokens` — plus de Sora / Work Sans. Icônes: Lucide uniquement, pas d'icônes emoji

## Progress

### Done

#### Mobile (Expo Router)
- **Dashboard** → `features/dashboard/screens/DashboardScreen.tsx` + `components/CircleCard.tsx`
- **CircleDetail** → `features/circles/screens/CircleDetailScreen.tsx`
- **Splash** → `features/onboarding/screens/SplashScreen.tsx`
- **Placeholders** → `CirclesScreen.tsx`, `CreateCircleScreen.tsx`, `NotificationsScreen.tsx`, `ProfileScreen.tsx`
- **Fix imports cassés** dans ProfileSetupScreen, KycIntroScreen, KycUploadScreen, KycSuccessScreen, LandingScreen
- **Supprimé `useFonts`** avec chemins relatifs fragiles de tous les écrans

#### Web (Next.js)
- **Landing page** → 6 composants dans `features/landing/components/` (HeroSection, FeaturesSection, HowItWorksSection, SecuritySection, TestimonialsSection, CTASection)
- **Dashboard** → 4 composants dans `features/dashboard/components/` (StatsCards, CircleCardGrid, RecentTransactions, NotificationsList)
- **Auth** → `features/auth/components/LoginForm.tsx`
- **Répertoire** `src/components/` créé pour composants partagés

#### Backoffice (Next.js Admin)
- **Dashboard admin** → 4 composants dans `features/dashboard/components/` (StatsCards, RecentUsersList, RecentCirclesList, AlertsSection)
- **Users page** → `features/users/components/UsersTable.tsx`
- **Répertoire** `features/dashboard/components/` et `features/users/components/` créés

### In Progress
- None

### Blocked
- None

## Key Decisions
- **Refonte visuelle mobile (oct. 2026)** : style épuré type Pinterest — fonds blancs / gris clair, cartes à bord fin, pas de dégradés ni d'ombres colorées, plus d'en-tête vert + feuille arrondie sur les écrans refaits.
  - Police système (comme Facebook) : aucune police à télécharger, démarrage plus rapide sur réseaux lents. Échelle : 28 / 22 / 17 / 15 / 14 / 13 / 12.
  - Palette unifiée dans `packages/design-tokens/src/native.ts` (ink, inkSoft, muted, subtle, line, lineStrong, fill) — remplace le mélange Tailwind / Chakra (96 → ~49 couleurs, dont celles des opérateurs).
  - Composants partagés : `venega-mobile/src/components/ui` (Button, TextField, IconButton, Sheet, ListRow/ListGroup, Chip, OptionCard, Segmented, NumberStepper, SettingRow, Toggle).
- **Type de cercle HYBRID supprimé côté mobile** : seuls Tontine (espèces ou nature) et Caisse de solidarité sont proposés. Côté données, « Tontine + nature » reste `CircleType.NATURE` + `contributionMode: NATURE`. ⚠️ L'enum Prisma de `venega-api` contient encore `HYBRID` — à retirer par le responsable backend.
- **Écran « Prêt à commencer ? » (landing) supprimé** : onboarding (3 slides) → connexion directe.
- **Import `designTokens` cassé**: Tous les écrans utilisant `import { designTokens } from '@venega/design-tokens/native'` avaient un export inexistant. Standardisé en `import { colors, spacing, radius } from '@venega/design-tokens'`
- **Chargement des polices centralisé**: Supprimé `useFonts` avec `../../../../../../packages/design-tokens/fonts/...` des écrans individuels
- **Fichiers `app/` = wrappers fins**: Pattern: `import XScreen from '../../src/features/x/screens/XScreen'; export default XScreen;`
- **Backoffice**: Gardé en tant qu'application Next.js séparée (pas de route group dans web) selon le brief

## Next Steps
1. Vérifier que les builds mobile et web compilent après tous les refactorings
2. Ajouter les alias de couleurs manquants dans `native.ts` (textPrimary, textSecondary, background)
3. Vérifier que le chemin d'import `@venega/design-tokens` se résout correctement dans Expo
4. Quand le backend sera prêt, connecter la couche API — créer des dossiers `src/features/*/api/`
5. Ajouter la pagination et la recherche côté backoffice

## Critical Context
- Package `@venega/design-tokens` exports: `{ ".": "./src/index.ts", "./css": "./tokens.css", "./tailwind-preset": "./tailwind-preset.js" }` — PAS d'export `"./native"`
- `native.ts` exports: `colors`, `radius`, `spacing`, `shadows`, `fonts` — PAS d'objet `designTokens`
- Certains écrans reference `designTokens.colors.textPrimary` → mapping vers `colors.text`
- Données mock dans `packages/types/src/mock-data.ts`, importées via `@venega/types`

## Relevant Files / Directories

### Mobile
- `venega/apps/mobile/app/` — tous les fichiers routes (wrappers fins)
- `venega/apps/mobile/app/(tabs)/_layout.tsx` — config tab bar
- `venega/apps/mobile/app/_layout.tsx` — layout Stack root
- `venega/apps/mobile/src/features/` — tous les écrans extraits

### Web
- `venega/apps/web/src/app/(public)/page.tsx` — wrapper fin
- `venega/apps/web/src/app/(app)/dashboard/page.tsx` — wrapper fin
- `venega/apps/web/src/app/(auth)/login/page.tsx` — wrapper fin
- `venega/apps/web/src/features/landing/components/` — 6 composants
- `venega/apps/web/src/features/dashboard/components/` — 4 composants
- `venega/apps/web/src/features/auth/components/LoginForm.tsx`
- `venega/apps/web/src/components/` — composants partagés

### Backoffice
- `venega/apps/backoffice/src/app/(admin)/page.tsx` — wrapper fin
- `venega/apps/backoffice/src/app/(admin)/users/page.tsx` — wrapper fin
- `venega/apps/backoffice/src/app/(admin)/kyc/page.tsx` — wrapper fin
- `venega/apps/backoffice/src/app/(admin)/circles/page.tsx` — wrapper fin
- `venega/apps/backoffice/src/features/dashboard/components/` — 4 composants extraits
- `venega/apps/backoffice/src/features/users/components/UsersTable.tsx`

### Partagé
- `venega/packages/design-tokens/src/native.ts` — définitions tokens
- `venega/packages/design-tokens/package.json` — config exports
- `venega/packages/types/src/mock-data.ts` — données mock
- `venega/packages/types/src/enums.ts` — enums partagés
- `venega/packages/types/src/models.ts` — interfaces TypeScript
