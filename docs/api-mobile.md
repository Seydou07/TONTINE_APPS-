# API attendue par l'app mobile Venega

Destinataire : responsable de `venega-api`.
Base : `/api/v1`, JWT en `Authorization: Bearer`. Montants en F CFA entiers.

L'app mobile (`venega-mobile`) appelle l'API via `src/lib/api` dès que `EXPO_PUBLIC_API_URL` est défini (voir `venega-mobile/.env.example`). Sans cette variable, elle reste en mode démo (données locales, OTP `123456`).

Légende : ✅ existe et l'app l'utilise · 🟡 existe mais à corriger ou compléter · ❌ manque

---

## 1. Failles à corriger en priorité

| # | Problème | Où | Risque | Correction proposée |
|---|---|---|---|---|
| S1 | Le jeton de rafraîchissement (7 j) est signé avec le même secret que le jeton d'accès, et `JwtStrategy` accepte tout jeton signé. | `auth.service.ts` `generateTokens`, `jwt.strategy.ts` | Un jeton de rafraîchissement volé sert de jeton d'accès pendant 7 jours. | Secret distinct (`JWT_REFRESH_SECRET`) ou champ `typ: 'refresh'` refusé par la stratégie. Stocker un **hash** du jeton de rafraîchissement, pas le jeton en clair. |
| S2 | Code OTP fixe `123456` côté serveur ; la connexion ne vérifie pas `isPhoneVerified`. | `auth.service.ts` `verifyOtp`, `login` | N'importe qui peut valider n'importe quel numéro. | Envoi SMS réel, code aléatoire haché, expiration 5 min, 5 essais max, limite de débit par numéro et par IP. Refuser les actions sensibles tant que le téléphone n'est pas vérifié. |
| S3 | Pas de limite de tentatives sur `login` / `verify-otp`. | `auth.controller.ts` | Force brute des mots de passe et des OTP. | `@nestjs/throttler` sur les routes `auth/*`. |
| S4 | `GET /users/:id` renvoie le profil de n'importe quel utilisateur à tout compte connecté. | `users.controller.ts` | Fuite de données personnelles (nom, téléphone, statut KYC). | Autoriser seulement si les deux utilisateurs partagent un cercle ; renvoyer un profil réduit. |
| S5 | La création de cercle ne vérifie pas le KYC. | `circles.service.ts` `create` | Cercles fictifs, arnaques. | Exiger `kycStatus === VERIFIED` côté serveur (l'app le vérifie déjà, mais ça ne suffit pas). |
| S6 | Aucun webhook CinetPay : `confirmPayment` existe mais n'est exposé nulle part ; `pay` ne lance pas le paiement. | `transactions.service.ts` | Aucun paiement n'est réellement confirmé. | Voir section 4. |
| S7 | `HYBRID` est toujours dans l'enum Prisma `CircleType`. | `prisma/schema.prisma` | Données incohérentes avec l'app (type supprimé). | Migration : retirer `HYBRID`. |

---

## 2. Authentification et profil

| Écran mobile | Appel | État |
|---|---|---|
| Inscription (prénom, nom, téléphone, mot de passe) | `POST /auth/register` → `{ accessToken, refreshToken }` | ✅ |
| Code SMS | `POST /auth/verify-otp` `{ phoneNumber, code }` | 🟡 voir S2 |
| Renvoyer le code | `POST /auth/resend-otp` `{ phoneNumber }` | ❌ l'app affiche « pas encore disponible » |
| Connexion | `POST /auth/login` | ✅ (voir S3) |
| Session expirée | `POST /auth/refresh` `{ refreshToken }` | ✅ (voir S1) |
| Déconnexion | `POST /auth/logout` | ✅ |
| Mot de passe oublié | `POST /auth/forgot-password` + `POST /auth/reset-password` (via OTP) | ❌ |
| Profil | `GET /users/me`, `PATCH /users/me` `{ displayName }` | ✅ |
| Numéro Mobile Money, e-mail | Ajouter `mobileMoneyNumber`, `email` à `PATCH /users/me` | ❌ |
| Photo de profil | Envoi de fichier, voir section 6 | ❌ |

Le téléphone est envoyé au format `+226XXXXXXXX`.

---

## 3. Cercles

| Écran mobile | Appel | État |
|---|---|---|
| Accueil, onglet Cercles | `GET /circles/my` | 🟡 doit renvoyer aussi `nextContributionDate` (l'app l'estime aujourd'hui), le rôle de l'utilisateur, le nombre de membres, `activatedAt` |
| Créer un cercle | `POST /circles` | 🟡 champs manquants : `goalItem` + photo (tontine en nature), `maxMembers`, `conditions`, `kycRequirement` (aucun / CNIB / CNIB + selfie), `managementFee`, règles de départ et de remplacement |
| Frais de création (2 000 F) puis activation | `POST /circles/:id/activate` après paiement confirmé | ❌ |
| Rejoindre par code | `GET /circles/join/:inviteCode`, `POST /circles/:id/join` | ✅ (les URL CNIB viennent de l'envoi de fichiers, section 6) |
| Demandes d'adhésion (fondateur) | `GET /circles/:id/requests`, `PATCH /circles/requests/:requestId` | ✅ |
| Documents d'un membre (CNIB recto, verso, selfie) | `GET /circles/:id/members/:userId/documents` → URL signées courtes | ❌ réservé au fondateur ; à journaliser |
| Fiche cercle, membres, ordre de passage | `GET /circles/:id` avec membres, cycle actif, bénéficiaire du tour | 🟡 vérifier que les membres et le cycle sont inclus |
| Gestion : retirer un membre, changer l'ordre | `DELETE /circles/:id/members/:userId`, `PATCH /circles/:id/members/:userId` `{ turnOrder }` | ❌ |
| Demande de départ | `POST /circles/:id/departures`, `PATCH /circles/departures/:id` | ❌ |
| Historique | `GET /transactions/my`, `GET /transactions/circle/:circleId` | ✅ |

Rôles côté app : tontine = **fondateur** (`PRESIDENT` en base) et membres seulement. Caisse de solidarité = président + validateurs.

---

## 4. Paiements (CinetPay, côté serveur uniquement)

Parcours dans l'app, identique pour tous les paiements : choix de l'opérateur → « Payer X F CFA » → « Confirmer le paiement » → l'app compose le code USSD puis attend la confirmation.

| Besoin | Appel attendu | État |
|---|---|---|
| Lancer un paiement | `POST /payments` `{ purpose, circleId?, appealId?, amount, provider, phoneNumber }` → `{ paymentId, ussdCode?, checkoutUrl? }`. `purpose` ∈ `CONTRIBUTION`, `CREATION_FEE`, `ADHESION`, `DONATION` | 🟡 `POST /transactions/pay` couvre seulement la cotisation |
| Suivre le paiement | `GET /payments/:paymentId` → `PENDING` / `COMPLETED` / `FAILED` | ❌ l'app interrogera toutes les 5 s, pendant 3 min au maximum |
| Confirmation CinetPay | `POST /payments/cinetpay/webhook` : vérifier la signature (`x-token` HMAC), puis **revérifier le statut auprès de CinetPay** avant de marquer `COMPLETED` ; traitement idempotent | ❌ |
| Opérateurs | `ORANGE_MONEY`, `MOOV_MONEY`, **`WAVE`** | 🟡 Wave manque dans `PayContributionDto` |
| Verser la cagnotte du tour (fondateur) | `POST /transactions/payout` | 🟡 cash-out CinetPay à faire ; exiger que toutes les cotisations du tour soient payées |

Le montant est toujours recalculé par le serveur ; ne jamais faire confiance au montant envoyé par l'app.

**Montant inférieur au montant dû** (ex. 8 000 F reçus pour 10 500 F de cotisation + frais) : le paiement n'est **jamais** compté comme payé. `GET /payments/:paymentId` renvoie `PARTIAL` avec `received` et `missing` ; la somme reçue est conservée comme acompte sur cette cotisation, et l'app propose « Compléter <missing> ». La cotisation passe à payée seulement quand le cumul atteint le montant dû. Sans complément avant l'échéance, les règles de retard s'appliquent ; un remboursement se demande via le back-office. Rien reçu au bout de 3 min → `EXPIRED` (l'app affiche « Paiement non reçu », dont le cas « solde insuffisant »).

Côté app, le code USSD est lancé directement (Android, autorisation `CALL_PHONE`) : l'utilisateur ne peut pas modifier le montant, il saisit seulement son code secret dans la fenêtre de l'opérateur. Seul un contrat de paiement marchand avec l'opérateur (montant imposé par Venega) empêcherait totalement l'envoi d'un montant inférieur composé hors de l'app.

---

## 5. Caisse de solidarité

| Écran mobile | Appel | État |
|---|---|---|
| Demander une aide | `POST /solidarity/requests` | ✅ |
| Le président initie une aide pour un membre | `POST /solidarity/requests` avec `beneficiaryUserId` | ❌ champ à ajouter, réservé au président |
| Vote des membres | `POST /solidarity/requests/:id/vote` | ✅ |
| Validation du bureau (président + validateurs) | `POST /solidarity/requests/:id/approve` | ❌ |
| Décaissement | `PATCH /solidarity/requests/:id/disburse` | 🟡 exiger la double validation |
| Solde et grand livre | `GET /solidarity/circles/:id/ledger` | ❌ |

---

## 6. Fichiers (CNIB, selfie, photo du bien, photo de profil)

| Besoin | Appel attendu | État |
|---|---|---|
| Envoi | `POST /uploads` (multipart, image ≤ 2 Mo, JPEG/PNG) → `{ fileId }` ; ou URL pré-signée S3 | ❌ |
| KYC | `POST /users/me/kyc` avec les `fileId` | 🟡 accepte des URL libres aujourd'hui ; n'accepter que des fichiers envoyés par l'utilisateur lui-même |
| Lecture | URL signées de 5 min, jamais publiques | ❌ |

L'app compresse les photos avant l'envoi (réseaux lents).

---

## 7. Cagnottes d'aide publiques

Lien partagé : `https://venega.app/c/<code>` (domaine à confirmer). Page web sans compte : `venega-web/src/app/c/[code]`.

| Besoin | Appel attendu | État |
|---|---|---|
| Créer (compte KYC vérifié) | `POST /appeals` `{ title, story, goalAmount, endDate?, photoFileId? }` → `{ id, code }` | ❌ |
| Mes cagnottes | `GET /appeals/my` | ❌ |
| Page publique (sans compte) | `GET /public/appeals/:code` → titre, histoire, objectif, collecté, nombre de dons, derniers dons (nom ou « Anonyme ») | ❌ |
| Don sans compte | `POST /public/appeals/:code/contributions` `{ amount, provider, phoneNumber, displayName?, anonymous }` → paiement de la section 4 | ❌ limite de débit par IP et par numéro ; montant minimum |
| Signaler une cagnotte | `POST /public/appeals/:code/reports` | ❌ |
| Retrait des fonds par l'organisateur | `POST /appeals/:id/withdraw` | ❌ |

---

## 8. Notifications

| Besoin | Appel attendu | État |
|---|---|---|
| Liste | `GET /notifications`, `PATCH /notifications/:id/read` | ❌ (le modèle `AppNotification` existe) |
| Push | `POST /users/me/push-token` `{ expoPushToken }` puis envoi par Expo Push | ❌ |
| Évènements | rappel la veille de la cotisation, retard, tour gagné, cagnotte versée, demande d'adhésion, décision KYC | ❌ |

---

## 9. Tâches automatiques côté serveur

- Calcul de `nextContributionDate` pour chaque cercle actif.
- Rappel J-1 et jour J ; marquage des retards ; pénalités selon les règles du cercle.
- Exclusion ou alerte au fondateur après X retards (X dans les règles du cercle).
- Clôture des cagnottes à leur date de fin.

---

## 10. Back-office (`venega-backoffice`)

Endpoints `GET|PATCH /admin/...` attendus par le back-office (KYC, modération des cagnottes, alertes de fraude) : voir les commentaires `TODO API` dans `venega-backoffice/src/features/*/api.ts`. Toutes ces routes doivent exiger un rôle administrateur distinct des comptes utilisateurs.
