# Audit du backend `venega-api`

Destinataire : responsable de `venega-api`.
Date : 30/10/2026. Base : branche `refonte-design-mobile`, commit `83433bf`.
Périmètre : `src/**`, `prisma/schema.prisma`, `prisma/seed.ts`, `docs/BACKEND_SCHEMA.md`, `package.json`, `tsconfig.json`, `nest-cli.json`, `.gitignore`. Aucun fichier de `venega-api` n'a été modifié.

Les failles S1 à S7 de [`api-mobile.md` § 1](api-mobile.md#1-failles-à-corriger-en-priorité) restent valables et ne sont pas répétées ici. Les numéros ci-dessous (A, B, C…) sont nouveaux.

Gravité : **H** haute · **M** moyenne · **B** basse.

---

## 1. Structure actuelle

```
venega-api/
├── docs/BACKEND_SCHEMA.md
├── prisma/
│   ├── schema.prisma        (pas de dossier migrations/)
│   └── seed.ts
├── src/
│   ├── main.ts              préfixe api/v1, CORS, ValidationPipe, Swagger
│   ├── app.module.ts
│   ├── prisma/              PrismaModule global + PrismaService
│   ├── auth/                controller, service, jwt.strategy, jwt-auth.guard, dto/
│   ├── users/               controller, service, dto/
│   ├── circles/             controller, service, dto/
│   ├── transactions/        controller, service, dto/
│   └── solidarity/          controller, service, dto/
├── package.json · tsconfig.json · nest-cli.json · .gitignore
└── (aucun test, aucun .env.example, aucune config ESLint)
```

### Ce qui va bien

| Point | Où |
|---|---|
| Un module NestJS par domaine métier, découpage lisible | `src/*/` |
| `ValidationPipe` global avec `whitelist` + `forbidNonWhitelisted` + `transform` | `main.ts:23-29` |
| Préfixe versionné `api/v1` | `main.ts:10` |
| DTO `class-validator` sur les corps de requête principaux | `*/dto/*.ts` |
| Mots de passe hachés en bcrypt (coût 12), hash retiré des réponses | `auth.service.ts:25`, `users.service.ts:50-53` |
| Contrôle d'appartenance au cercle avant lecture des données d'un cercle | `circles.service.ts:66-67`, `transactions.service.ts:152-155`, `solidarity.service.ts:89-92` |
| `$transaction` déjà utilisé pour créer un cercle, valider une adhésion, décaisser | `circles.service.ts:15`, `:164`, `solidarity.service.ts:124` |
| Montants en entiers F CFA (`Int`), pas de flottants | `schema.prisma:228-229`, `:363` |
| Contraintes d'unicité utiles (`userId_circleId`, `requestId_userId`) | `schema.prisma:315`, `:428` |
| `.env` ignoré par Git ; aucun fichier `.env` dans l'historique Git | `.gitignore:3` |
| Requêtes uniquement via Prisma (paramétrées) : pas d'injection SQL trouvée | tout `src/` |

---

## 2. Problèmes de structure et de code

### 2.1 Organisation, configuration, build

| # | Problème | Où | Grav. | Correction proposée |
|---|---|---|---|---|
| A1 | Pas de dossier `prisma/migrations/` : aucun historique de schéma, déploiement non reproductible. | `prisma/` | H | `prisma migrate dev --name init` en local, committer `migrations/`, utiliser `prisma migrate deploy` en staging/prod. |
| A2 | Dépendance `@venega/types` vers `file:../venega-mobile/packages/types/dist` ; ce `dist/` n'existe pas dans le dépôt. Un `npm ci` neuf dépend d'un build préalable du mobile. Les enums utilisés à l'exécution par les DTO (`IsEnum(CircleType)`) viennent de ce paquet. | `package.json:19`, `create-circle.dto.ts:2`, `submit-aid-request.dto.ts:2` | H | Sortir `packages/types` à la racine du monorepo (workspace npm) ou le publier en paquet interne ; documenter l'ordre de build. Les enums de validation doivent rester alignés sur Prisma (`@prisma/client`). |
| A3 | Aucune validation des variables d'environnement ; pas de `.env.example`. `JWT_SECRET` absent = démarrage cassé ou comportement imprévisible. | `app.module.ts:12`, `auth.module.ts:17`, `jwt.strategy.ts:16` | H | `ConfigModule.forRoot({ validate })` avec un schéma (zod, déjà en dépendance) : `DATABASE_URL`, `JWT_SECRET` (≥ 32 car.), `JWT_REFRESH_SECRET`, `APP_PORT`, `NODE_ENV`, `CORS_ORIGINS`, clés CinetPay. Ajouter `.env.example` sans valeurs réelles. |
| A4 | Pas de séparation dev / staging / prod : CORS en dur sur `localhost`, Swagger toujours exposé, OTP fixe sans garde d'environnement. | `main.ts:13-20`, `:39`, `auth.service.ts:63` | H | `NODE_ENV` + `CORS_ORIGINS` lus depuis la config ; Swagger seulement hors prod (ou derrière auth) ; tout code « dev » (OTP fixe) refusé au démarrage si `NODE_ENV=production`. |
| A5 | Script `lint` appelle `eslint`, mais ni ESLint ni sa config ne sont installés. `seed` documenté via `npx prisma db seed` mais pas de clé `prisma.seed` dans `package.json`. | `package.json:14`, `seed.ts:4` | B | Ajouter `eslint` + config Nest, ou retirer le script. Ajouter `"prisma": { "seed": "ts-node prisma/seed.ts" }`. |
| A6 | `zod` est en dépendance mais n'est utilisé nulle part (et la version est vulnérable, voir C-dép). | `package.json:37` | B | L'utiliser pour A3 en version à jour, sinon le retirer. |
| A7 | `tsconfig` sans `strict: true` ; `any` partout (`req: any`, `where: any`, `sanitize(user: any)`). | `tsconfig.json`, `users.controller.ts:17`, `transactions.service.ts:157`, `users.service.ts:50` | M | Activer `strict`. Décorateur `@CurrentUser()` typé (`AuthUser`). Types Prisma (`Prisma.TransactionWhereInput`). |
| A8 | Garde JWT répétée sur chaque contrôleur ; pas de dossier `common/` (décorateurs, gardes, filtres). | `*.controller.ts` | B | Garde JWT globale (`APP_GUARD`) + décorateur `@Public()` pour `auth/*`. |
| A9 | Doublon fonctionnel : `GET /users/me/circles` et `GET /circles/my` font la même chose avec des formats différents. `UsersService.findByPhone` exporté mais inutilisé (`AuthService` lit Prisma directement). | `users.controller.ts:33-37`, `circles.controller.ts:22-26`, `users.service.ts:14` | B | Garder `GET /circles/my` ; supprimer l'autre. `AuthService` passe par `UsersService`. |
| A10 | Le modèle `Admin` / `AuditLog` existe mais aucun module admin n'est exposé ; aucune journalisation des actions utilisateur sensibles (adhésion, versement, décaissement). | `schema.prisma:536-570` | M | Module `admin/` séparé (auth distincte), et table d'audit générique alimentée par les opérations d'argent. |

### 2.2 DTO et validation

| # | Problème | Où | Grav. | Correction proposée |
|---|---|---|---|---|
| B1 | `refresh` et `logout` lisent `@Body('refreshToken')` sans DTO : la valeur n'est pas validée (type primitif ignoré par `ValidationPipe`). Voir aussi C1. | `auth.controller.ts:34`, `:42` | H | `RefreshTokenDto { @IsString() @IsNotEmpty() refreshToken }`. |
| B2 | Filtres `type`, `status`, `cycleId` en query sans validation, injectés tels quels dans `where` : une valeur hors enum provoque une erreur Prisma (500). | `transactions.controller.ts:38-40`, `transactions.service.ts:157-160` | M | `TransactionFilterDto` avec `@IsEnum(TransactionType)`, `@IsEnum(TransactionStatus)`, `@IsOptional()`. |
| B3 | Paramètres de route (`:id`, `:circleId`, `:requestId`) non validés. | tous les contrôleurs | B | `ParseCuidPipe` (regex cuid) ou `@Matches` sur un DTO de params. |
| B4 | Aucune longueur max sur les chaînes (`reason`, `name`, `fullName`, `displayName`, `rejectionReason`) ni montant max (`amount`, `amountRequested`, `tontineAmount`). | `submit-aid-request.dto.ts:15-21`, `create-circle.dto.ts:6-21`, `update-profile.dto.ts`, `request-join.dto.ts` | M | `@MaxLength` partout ; `@Max` sur les montants (plafond métier, ex. 5 000 000 F). |
| B5 | URL de fichiers acceptées comme chaînes libres (`avatarUrl`, `proofUrl`, `cnibFrontUrl`, `kycDocumentUrl`) : pas même `@IsUrl`. | `update-profile.dto.ts:18-20`, `submit-aid-request.dto.ts:23-25`, `request-join.dto.ts:14-18` | M | En attendant `POST /uploads` (api-mobile § 6) : `@IsUrl({ protocols: ['https'] })` + liste blanche du domaine de stockage. |
| B6 | Aucun `@ApiProperty` et pas de plugin Swagger dans `nest-cli.json` : les schémas OpenAPI des DTO et des réponses sont vides. | `nest-cli.json`, `*/dto/*.ts` | M | Activer `"plugins": ["@nestjs/swagger"]` dans `nest-cli.json` ; DTO de réponse + `@ApiResponse` sur les routes. |
| B7 | `POST /circles` accepte `type: AID_APPEAL` (cercle d'appel public) sans flux dédié. | `create-circle.dto.ts:10-11` | M | `@IsIn([TONTINE_ONLY, SOLIDARITY_ONLY, NATURE])` ; les cagnottes publiques passent par `/appeals` (api-mobile § 7). |

### 2.3 Erreurs, logs

| # | Problème | Où | Grav. | Correction proposée |
|---|---|---|---|---|
| D1 | Pas de filtre d'exception global : les erreurs Prisma (`P2002` unicité, `P2025` introuvable) remontent en 500. Cas réels : deux inscriptions simultanées du même numéro, double validation d'adhésion, code d'invitation en collision, double vote simultané. | `auth.service.ts:27`, `circles.service.ts:16`, `:182`, `solidarity.service.ts:55` | M | `PrismaExceptionFilter` global : `P2002` → 409, `P2025` → 404, le reste → 500 avec message générique ; détails seulement dans les logs. |
| D2 | Logs par `console.log` (avec emojis), pas de `Logger`, pas d'identifiant de requête, rien sur les opérations d'argent. | `main.ts:43-44` | M | `Logger` Nest (ou `nestjs-pino`) en JSON, `requestId` par requête, journal explicite à chaque changement de statut de transaction. Ne jamais journaliser mots de passe, OTP, jetons. |
| D3 | Pas de route de santé pour le déploiement / la supervision. | `app.module.ts` | B | `GET /health` (`@nestjs/terminus`, ping base). |
| D4 | Messages d'erreur qui permettent de savoir si un numéro est inscrit : « déjà inscrit » à l'inscription, « Utilisateur non trouvé » à l'OTP, et `login` répond plus vite si le numéro n'existe pas (pas de `bcrypt.compare`). | `auth.service.ts:22`, `:71`, `:44-46` | B | Réponse neutre sur `verify-otp` ; `bcrypt.compare` contre un hash factice si l'utilisateur n'existe pas. L'inscription peut garder son message mais doit être limitée en débit (S3). |

### 2.4 Contrôleur / service / accès aux données, transactions Prisma, idempotence

Les services mélangent règles métier et requêtes Prisma ; les contrôles « est membre », « est président » sont copiés dans chaque service.

| # | Problème | Où | Grav. | Correction proposée |
|---|---|---|---|---|
| E1 | `recordContribution` : `cycleId` envoyé par le client jamais vérifié (il peut appartenir à un autre cercle ou être inactif) ; aucune idempotence (chaque appel crée de nouvelles transactions `PENDING`) ; les deux `create` ne sont pas dans une `$transaction` ; un membre parti (`leftAt`) ou exclu peut cotiser. | `transactions.service.ts:14-65` | H | Prendre `circle.activeCycleId` côté serveur ; en-tête `Idempotency-Key` stocké (unique) ou contrainte unique `(userId, cycleId, turn, type)` ; `$transaction` ; vérifier `leftAt == null && !isExcluded`. |
| E2 | `initiatePayout` : **le montant vient du client** (`dto.amount`) ; `beneficiaryUserId` jamais vérifié comme membre du cercle ni comme bénéficiaire du tour ; si aucune `TurnValidation` n'existe, le contrôle est sauté (`if (turnValidation && …)`) ; `cycleId` non rattaché au cercle ; pas d'idempotence (versements multiples possibles). | `transactions.service.ts:106-145`, `initiate-payout.dto.ts:14-16` | H | Supprimer `amount` du DTO ; calculer `beneficiaryAmount` depuis `TurnValidation` ; exiger une `TurnValidation` existante avec `canRelease` et `releasedAt == null` ; dans une `$transaction`, `updateMany({ where: { id, releasedAt: null } })` et refuser si `count === 0`. |
| E3 | `confirmPayment` (non exposé, cf. S6) : pas de contrôle `status === PENDING` avant de passer `COMPLETED` ; rejouer le webhook recrée un `ReliabilityEvent` ; s'applique aussi aux `PAYOUT` (met le bénéficiaire en `PAID`). | `transactions.service.ts:70-100` | H | `updateMany({ where: { id, status: 'PENDING' } })` + sortie si `count === 0` ; `providerReference` **unique** ; branche selon `type`. |
| E4 | `disburse` : le contrôle `status === APPROVED` est fait hors transaction → deux appels simultanés décaissent deux fois. `balanceAfter: 0` en dur, aucun contrôle de solde, `relatedTransactionId` non renseigné. | `solidarity.service.ts:109-155` | H | Dans la `$transaction` : `updateMany({ where: { id, status: 'APPROVED' }, data: { status: 'DISBURSED' } })`, refuser si `count === 0` ; lire le dernier solde avec verrou (`SELECT … FOR UPDATE` via `$queryRaw` ou niveau `Serializable`), refuser si solde insuffisant ; lier la transaction créée. |
| E5 | `vote` : création du vote, comptage et mise à jour du statut hors transaction (course entre votes simultanés) ; le demandeur peut voter pour lui-même ; les membres partis/exclus peuvent voter (pas de contrôle `leftAt`/`isExcluded`), et les exclus non partis comptent dans la majorité. | `solidarity.service.ts:36-83` | M | `$transaction` + mise à jour conditionnelle `where: { status: 'VOTING' }` ; interdire le vote du demandeur ; filtrer `leftAt: null, isExcluded: false` partout. |
| E6 | `decideJoinRequest` : contrôle `PENDING` hors transaction ; `maxMembers` jamais vérifié ; `turnOrder` calculé par `max+1` (course) ; l'adhésion est créée dès l'approbation alors que l'enum indique `APPROVED` = « peut payer » et `COMPLETED` = « a payé » (frais de rachat jamais encaissés). | `circles.service.ts:148-200`, `schema.prisma:104-109` | M | Mise à jour conditionnelle du statut dans la transaction ; refuser si `memberCount >= maxMembers` ; créer l'adhésion seulement après paiement (`COMPLETED`). |
| E7 | `submitRequest` (aide) : `cycleId` non vérifié, aucun contrôle que le cercle a une caisse de solidarité, membres partis acceptés. | `solidarity.service.ts:12-31` | M | Prendre le cycle actif côté serveur ; refuser si `solidarityAmount === 0` ; filtrer `leftAt`. |
| E8 | Contrôle d'appartenance qui ignore `leftAt` et `isExcluded` : un ancien membre garde l'accès en lecture aux détails, transactions et demandes d'aide du cercle. | `circles.service.ts:66`, `transactions.service.ts:16`, `:152`, `solidarity.service.ts:14`, `:44`, `:89` | M | Un seul `MembershipGuard` / `assertActiveMember(circleId, userId, roles?)` réutilisé partout. |
| E9 | Code d'invitation par `Math.random()`, sans nouvel essai en cas de collision. | `circles.service.ts:218-225` | B | `crypto.randomInt` + boucle de nouvel essai sur `P2002`. |
| E10 | `memberCount` dénormalisé en plus de `_count.memberships` : deux sources de vérité. | `schema.prisma:245`, `circles.service.ts:88`, `:192` | B | Garder `_count` (filtré `leftAt: null`) ou mettre à jour `memberCount` uniquement dans le service d'adhésion. |

### 2.5 Schéma Prisma

| # | Problème | Où | Grav. | Correction proposée |
|---|---|---|---|---|
| F1 | `Transaction.user` et `Transaction.circle` en `onDelete: Cascade` : supprimer un utilisateur ou un cercle efface l'historique financier. Idem `LedgerEntry.circle`. | `schema.prisma:373-375`, `:444` | H | `onDelete: Restrict` sur tout ce qui touche à l'argent ; suppression logique (`status`, `deletedAt`) des comptes. |
| F2 | `providerReference` seulement indexé, pas unique : un même paiement CinetPay peut être enregistré deux fois. Pas de colonne de clé d'idempotence. | `schema.prisma:366`, `:386` | H | `providerReference String? @unique` ; `idempotencyKey String? @unique`. |
| F3 | `Transaction.cycleId` obligatoire : impossible d'enregistrer frais de création, adhésion ou don (api-mobile § 4). | `schema.prisma:361` | M | `cycleId String?` + champ `purpose`. |
| F4 | Enum `MobileMoneyProvider` sans `WAVE`. | `schema.prisma:143-146` | M | Ajouter `WAVE` (migration). |
| F5 | Index en double avec des contraintes `@unique` déjà indexées. | `schema.prisma:205`, `:220`, `:265`, `:550` | B | Retirer ces `@@index`. |
| F6 | Pas de `@@map` : tables en PascalCase (`"Circle"`), alors que la vue SQL commentée utilise `circle_id`. | `schema.prisma:576-595` | B | Choisir une convention (`@@map("circles")`, `@map("circle_id")`) avant la première migration. |
| F7 | `seed.ts` crée un cercle `HYBRID` (type retiré) et un solde de caisse négatif (`-38000`). | `seed.ts:94-98`, `:236` | B | Mettre à jour avec S7. |

### 2.6 Tests

| # | Problème | Où | Grav. | Correction proposée |
|---|---|---|---|---|
| G1 | Aucun test, aucune dépendance Jest, aucun script `test`. | `package.json` | H | Jest + `@nestjs/testing`. Priorité : tests e2e (Supertest, base Postgres jetable) sur auth, paiement, versement, décaissement, vote, y compris appels concurrents et rejeu. |

### 2.7 Conventions de nommage

| # | Constat | Grav. | Proposition |
|---|---|---|---|
| H1 | Routes peu homogènes : `circles/my` vs `users/me`, `PATCH circles/requests/:requestId` (ressource hors du cercle), `PATCH …/disburse` (action en PATCH) vs `POST …/vote`. | B | `me` partout ; actions en `POST /ressource/:id/action` ; sous-ressources sous leur parent. |
| H2 | « Président » en base (`PRESIDENT`) mais « fondateur » côté app pour les tontines (api-mobile § 3). | B | Documenter la correspondance dans Swagger ; ne pas renommer l'enum sans migration. |

---

## 3. Sécurité (en plus de S1 à S7)

| # | Problème | Où | Grav. | Correction proposée |
|---|---|---|---|---|
| C1 | **`POST /auth/logout` sans corps supprime tous les jetons de rafraîchissement de tous les utilisateurs.** `refreshToken` vaut `undefined` ; pour Prisma, `where: { token: undefined }` équivaut à `where: {}` → `deleteMany` vide la table. N'importe quel compte connecté peut déconnecter toute la plateforme. De plus, le jeton supprimé n'est pas rattaché à `req.user` (on peut révoquer le jeton d'un autre). | `auth.controller.ts:42`, `auth.service.ts:98-101` | H | DTO obligatoire (B1) + `deleteMany({ where: { token, userId: req.user.id } })`. Même DTO pour `refresh` (`undefined` → erreur Prisma 500). |
| C2 | `GET /users/:id` (S4) renvoie aussi `kycDocumentUrl`, `kycSelfieUrl`, `kycDocumentType`, `email`, `isPhoneVerified`, `status` : `sanitize` ne retire que `passwordHash`. Les photos de CNIB et selfie d'un utilisateur sont lisibles par tout compte connecté. | `users.controller.ts:39-43`, `users.service.ts:8-12`, `:50-53` | H | `select` explicite (liste blanche) dans un DTO de réponse public ; jamais d'URL KYC hors du propriétaire et de l'admin. |
| C3 | Versement : montant et bénéficiaire fournis par le client (E2). Un président peut se verser n'importe quel montant ou verser à un non-membre. | `transactions.service.ts:130-139` | H | Voir E2. |
| C4 | Double décaissement possible par appels simultanés (E4) ; double versement (E2) ; rejeu de confirmation (E3). | voir E2–E4 | H | Mises à jour conditionnelles + contraintes uniques. |
| C5 | KYC : un utilisateur `VERIFIED` peut resoumettre d'autres documents (statut repasse `PENDING`, mais les URL validées sont écrasées). | `users.service.ts:24-36` | M | Refuser si `kycStatus` est `PENDING` ou `VERIFIED` ; historiser les soumissions. |
| C6 | Adhésion : `fullName`, `phoneNumber` saisis librement au lieu d'être pris du compte (usurpation d'identité possible auprès du fondateur) ; `POST /circles/:id/join` fonctionne avec le seul `id` du cercle, sans code d'invitation. | `circles.service.ts:104-146`, `request-join.dto.ts` | M | Remplir nom et téléphone depuis `User` ; exiger `inviteCode` dans le corps et le comparer. |
| C7 | Rafraîchissement : le statut du compte n'est pas revérifié (un compte suspendu obtient de nouveaux jetons) ; pas de détection de réutilisation ; jetons expirés jamais purgés. | `auth.service.ts:82-96` | M | Vérifier `user.status === 'ACTIVE'` ; si un jeton déjà consommé est présenté, révoquer toute la famille ; tâche de purge. |
| C8 | Pas d'en-têtes de sécurité (`helmet`), pas de `trust proxy` configuré (utile derrière un proxy pour la limitation de débit par IP, cf. S3). | `main.ts` | M | `app.use(helmet())` ; `app.set('trust proxy', 1)` selon l'hébergement. |
| C9 | Swagger public en production (cartographie complète de l'API). | `main.ts:38-39` | M | Voir A4. |
| C10 | CORS : `credentials: true` alors que l'auth passe par en-tête `Bearer` (pas de cookie) ; origines en dur. L'app mobile native n'est pas soumise au CORS. | `main.ts:13-20` | B | `credentials: false` ; origines web/backoffice depuis `CORS_ORIGINS`. |
| C11 | Mot de passe minimum 6 caractères, sans autre règle. | `register.dto.ts:8-10` | B | 8 minimum ; limitation de débit (S3) indispensable. |

### Dépendances (`npm audit --omit=dev --package-lock-only`, sans installation)

13 vulnérabilités : **1 critique, 6 hautes, 6 moyennes**.

| Paquet | Gravité | Venant de | Correction |
|---|---|---|---|
| `proxy-addr` ≤ 2.0.7 | critique (usurpation d'IP) | Express | `npm audit fix` (sans rupture) |
| `body-parser` ≤ 1.20.8 | haute | Express | `npm audit fix` |
| `multer` ≤ 2.4.0 | haute (DoS) | `@nestjs/platform-express` | Montée de version Nest (rupture) ; à faire avant `POST /uploads` |
| `lodash` ≤ 4.17.23 | haute | `@nestjs/config`, `@nestjs/swagger` | Montée de version Nest |
| `js-yaml` 4.0–4.3.1 | haute | `@nestjs/swagger` | Montée de version Nest |
| `zod` < 4.6.6 | haute | dépendance directe inutilisée | Retirer ou passer en 4.x (A6) |
| `@nestjs/core` ≤ 11.1.17, `qs`, `file-type` | moyenne | Nest / Express | Montée de version Nest |

Recommandation : `npm audit fix` tout de suite (correctifs sans rupture), puis une montée de Nest 10 → version actuelle dans une branche dédiée, testée.

---

## 4. Arborescence cible

```
venega-api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/                 committé
│   └── seed.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── env.schema.ts           validation zod des variables
│   │   └── configuration.ts
│   ├── common/
│   │   ├── decorators/             current-user.decorator.ts, public.decorator.ts, roles.decorator.ts
│   │   ├── guards/                 jwt-auth.guard.ts (global), circle-member.guard.ts, circle-role.guard.ts
│   │   ├── filters/                prisma-exception.filter.ts, http-exception.filter.ts
│   │   ├── interceptors/           logging.interceptor.ts (requestId)
│   │   └── pipes/                  parse-cuid.pipe.ts
│   ├── prisma/                     PrismaModule, PrismaService
│   ├── health/                     health.controller.ts
│   └── modules/
│       ├── auth/                   controller, service, strategies/, dto/ (+ otp/)
│       ├── users/                  controller, service, dto/ (requête + réponse)
│       ├── circles/                controller, service, memberships.service.ts, join-requests.service.ts, dto/
│       ├── payments/               controller, service, cinetpay/ (client + webhook), dto/
│       ├── payouts/                versements de tour
│       ├── solidarity/             requests, votes, ledger.service.ts, dto/
│       ├── uploads/
│       ├── appeals/                (api-mobile § 7)
│       └── admin/                  auth admin distincte, audit
├── test/
│   ├── e2e/                        auth, payments, payouts, solidarity
│   └── jest-e2e.json
├── .env.example
└── package.json
```

Principe : contrôleur = HTTP + DTO uniquement ; service = règles métier ; toute opération d'argent passe par un seul service (`payments` / `ledger`) qui utilise `$transaction`, des mises à jour conditionnelles et une clé d'idempotence.

---

## 5. Ordre de travail priorisé

Chaque étape est une petite PR livrable séparément.

| Ordre | Étape | Couvre | Taille |
|---|---|---|---|
| 1 | `RefreshTokenDto` + `logout` limité à `req.user.id` | C1, B1 | XS |
| 2 | Profil public en liste blanche sur `GET /users/:id` | C2, S4 | XS |
| 3 | `npm audit fix` (correctifs sans rupture) ; retirer `zod` ou le mettre à jour | dépendances, A6 | XS |
| 4 | Validation des variables d'env + `.env.example` + CORS/Swagger/OTP selon `NODE_ENV` | A3, A4, C9, C10 | S |
| 5 | Première migration Prisma committée ; `onDelete: Restrict` sur l'argent ; `providerReference @unique` ; `WAVE` ; retrait `HYBRID` | A1, F1, F2, F4, S7 | S |
| 6 | Jest + premier test e2e (auth) dans la CI | G1 | S |
| 7 | `assertActiveMember` / gardes de rôle communs, `@CurrentUser()`, garde JWT globale | E8, A7, A8 | S |
| 8 | Filtre d'exception Prisma global + `Logger` structuré | D1, D2 | S |
| 9 | Versement : montant et bénéficiaire calculés serveur, mise à jour conditionnelle, tests de concurrence | E2, C3 | M |
| 10 | Décaissement et vote : transactions + mises à jour conditionnelles + solde du grand livre | E4, E5, C4 | M |
| 11 | Cotisation : cycle côté serveur, clé d'idempotence ; puis module `payments` + webhook CinetPay | E1, E3, S6 | M |
| 12 | Adhésion : `inviteCode` exigé, identité depuis le compte, `maxMembers`, adhésion après paiement | C6, E6 | M |
| 13 | DTO de réponse + plugin Swagger ; validation des query/params ; `@MaxLength`/`@Max` | B2–B6 | M |
| 14 | `helmet`, `trust proxy`, durcissement du rafraîchissement, KYC non resoumissible | C5, C7, C8 | S |
| 15 | Montée de version NestJS (branche dédiée, tests verts) ; réorganisation en `modules/` | dépendances, § 4 | M |
