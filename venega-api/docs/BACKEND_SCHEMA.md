# BACKEND_SCHEMA — Schéma backend Venega (hub de gestion de cercles)

> Documentation de référence des tables PostgreSQL pour le hub Venega.
> Le schéma Prisma actuel (`venega-api/prisma/schema.prisma`) sert de base ;
> ce document liste les **ajustements à faire** pour coller au frontend
> (`venega-mobile/packages/types`) après la refonte UX :
> frais de création 2 000 F, activation, adhésion par code, caisse de solidarité tracée.

---

## 1. Architecture cible

```
venega-mobile (Expo)
   │  fetch / POST JSON (JWT Bearer)
   ▼
venega-api (NestJS)
   │  Prisma ORM
   ▼
PostgreSQL
```

- L'argent circule par **USSD mobile money** (Orange, Moov, Wave).
- Le système **s'arment pour détecter** un paiement USSD : quand l'utilisateur
  exécute le code, un webhook/statut signale le paiement → l'API valide la
  transaction et met à jour les états (activation du cercle, paiement de
  l'adhésion, cotisation, versement).
- Le frontend simule cette détection (délais fixes) tant que les webhooks
  réels ne sont pas branchés.

---

## 2. Règles métier implémentées côté frontend (à reproduire backend)

| Règle | Comportement |
|---|---|
| **Frais de création** | `CIRCLE_CREATION_FEE = 2000` F. Un cercle créé n'est **pas actif** tant que le fondateur n'a pas payé. |
| **Activation** | Le cercle reçoit `activatedAt` à la réception du paiement (webhook USSD). Tant que `activatedAt` est absent, il n'apparaît pas dans les cercles actifs. |
| **Gate KYC** | Créer un cercle exige un KYC **VERIFIED**. Si `NOT_SUBMITTED`/`PENDING`/`REJECTED` → écran « Vérification identité requise ». |
| **Adhésion par code** | Pas de liste publique : champ code d'invitation seul → le formulaire est pré-rempli depuis `getCurrentUser()` → le fondateur approuve. |
| **Hybride / rachat** | Le frais de rachat (`joiningFee`) couvre uniquement les **tours rotatifs passés**. La caisse de solidarité n'est due qu'à partir du tour d'entrée. |
| **Caisse transparente** | CREDIT = cotisation individuelle tracée ; DEBIT = déboursement avec justificatif (`proofUrl`) exigé. |

---

## 3. Tables PostgreSQL

### 3.1 `users`

Source frontend : `User` (`packages/types/src/models.ts:30`).

| Colonne | Type | Notes |
|---|---|---|
| id | text PK (cuid) | |
| phoneNumber | text UNIQUE | |
| passwordHash | text | |
| displayName / firstName / lastName | text | |
| kycStatus | enum `KycStatus` | `NOT_SUBMITTED \| PENDING \| VERIFIED \| REJECTED` — gate à la création de cercle |
| kycDocumentUrl / kycSelfieUrl | text NULL | Pièces d'identité |
| kycDocumentType | enum `DocumentType` | `CNIB \| PASSPORT` |
| reputationScore | int | 0–100 |
| isPhoneVerified | bool | |
| createdAt / updatedAt | timestamptz | |

✅ Déjà dans le Prisma — **aucun changement**.

---

### 3.2 `circles`

Source frontend : `Circle` + `CircleRules` (`models.ts:151`, `:77`).

Le frontend attend **en plus** de l'existant :

| Colonne | Type | Statut | Notes |
|---|---|---|---|
| `activatedAt` | timestamptz NULL | 🔴 **à ajouter** | Cercle actif seulement après paiement des 2 000 F |
| `rules` | jsonb NOT NULL | 🔴 **à ajouter** | Objet `CircleRules` sérialisé |

Le JSON `rules` couvre (remplace à terme les colonnes séparées) :

```jsonc
{
  "refundRule": "IMMEDIATE" | "AT_CYCLE_END",
  "replacementRule": "PAY_PAST_TURNS" | "REDUCED_POT" | "NONE",
  "unlockRule": "ALL_APPROVERS" | "MAJORITY",
  "approversRequired": 3,
  "reservePercent": 5,                // 0–20
  "allowPublicContributions": false,
  "minContribution": null,
  "goalAmount": null,
  "goalItem": null,
  "kycRequirement": "REQUIRE_NONE" | "REQUIRE_CNIB" | "REQUIRE_CNIB_SELFIE"
}
```

Colonnes déjà présentes dans le Prisma : `tontineAmount`, `solidarityAmount`,
`frequency`, `contributionMode`, `beneficiariesPerTurn`, `inviteCode`,
`conditions`, `isActive`, `managementFee`, `depositRequired`,
`recalculateOnLeave`, `exclusionThreshold`, `nextPaymentRequired`,
`memberCount`, `maxMembers`, `activeCycleId`, `createdById`.

> 🔴 **Type `CircleType`** : ajouter `NATURE` et `AID_APPEAL` à l'enum Prisma
> (le frontend les utilise ; le Prisma n'a que `TONTINE_ONLY | SOLIDARITY_ONLY | HYBRID`).

---

### 3.3 `membership_requests`

Source frontend : `MembershipRequest` (`models.ts:300`).

Ajouts nécessaires par rapport au Prisma actuel :

| Colonne | Type | Statut | Notes |
|---|---|---|---|
| `selfieUrl` | text NULL | 🔴 **à ajouter** | Selfie facial si `kycRequirement = REQUIRE_CNIB_SELFIE` |
| `paymentStatus` | enum `AdhesionPaymentStatus` | 🔴 **à ajouter** | `UNPAID \| PAID` — bloqué tant que non payé |
| `paymentReference` | text NULL | 🔴 **à ajouter** | Réf. CityNet Pay du paiement d'adhésion |
| `paidAt` | timestamptz NULL | 🔴 **à ajouter** | Date du paiement |

Déjà présents : `joiningFee` (rachat tours passés), `depositAmount`,
`conditionsAccepted`, `cnibFrontUrl`, `cnibBackUrl`, `status`, `decidedAt`,
`decidedById`, `rejectionReason`.

> 🔴 **Relation** : `selfieUrl` appartient à la demande (pas à `users`) car le
> selfie exigé dépend de la règle du cercle ciblé.

---

### 3.4 `ledger_entries` (caisse de solidarité — grand livre)

Source frontend : `LedgerEntry` (`models.ts:495`).

C'est la table de **transparence** de la caisse : chaque CREDIT (cotisation
individuelle) et chaque DEBIT (déboursement justifié) y est tracé.

| Colonne | Type | Statut | Notes |
|---|---|---|---|
| id | text PK | ✅ | |
| circleId | FK → circles | ✅ | |
| type | enum `LedgerEntryType` | ✅ | `CREDIT \| DEBIT` |
| amount | int | ✅ | XOF |
| balanceAfter | int | ✅ | Solde après l'opération |
| description | text | ✅ | |
| **userId** | FK → users NULL | 🔴 **à ajouter** | Auteur du CREDIT / bénéficiaire du DEBIT |
| **memberName** | text NULL | 🔴 **à ajouter** | Nom affiché (permet l'affichage sans jointure) |
| **proofUrl** | text NULL | 🔴 **à ajouter** | Justificatif obligatoire en pratique pour les DEBIT |
| relatedTransactionId | FK → transactions NULL | ✅ | Réf. transaction liée |
| createdAt | timestamptz | ✅ | |

> Règle d'affichage : CREDIT → « membre X a cotisé » ; DEBIT → « aide validée
> pour Y » + badge « Justifié » si `proofUrl` présent.

---

### 3.5 `transactions`

Source frontend : `Transaction` (`models.ts:358`).

| Colonne | Type | Statut | Notes |
|---|---|---|---|
| id | text PK | ✅ | |
| userId / cycleId / circleId | FKs | ✅ | |
| amount | int | ✅ | |
| type | enum `TransactionType` | 🔴 **à étendre** | Ajouter `CIRCLE_CREATION_FEE` (frais d'activation 2 000 F) |
| status | enum `TransactionStatus` | ✅ | `PENDING \| COMPLETED \| FAILED` |
| providerReference | text NULL | ✅ | Réf. CityNet Pay |
| provider | enum `MobileMoneyProvider` | 🔴 **à étendre** | Le frontend gère aussi **Wave** (`PaymentMethod.WAVE`) |
| metadata | jsonb NULL | ✅ | |
| createdAt / updatedAt | timestamptz | ✅ | |

> Le nom d'affichage (`memberName`) est dérivé de la relation `user`, pas stocké
> — contrairement à `ledger_entries.memberName` qui le duplique volontairement
> pour l'historique public de la caisse.

---

### 3.6 `webhooks` (nouveau — détection des paiements USSD)

Table **à créer** pour tracer les confirmations de paiement reçues.

| Colonne | Type | Notes |
|---|---|---|
| id | text PK | |
| provider | enum | `ORANGE_MONEY \| MOOV_MONEY \| WAVE` |
| reference | text | Réf. opérateur |
| status | enum | `RECEIVED \| PROCESSED \| FAILED` |
| payload | jsonb | Corps brut reçu |
| processedAt | timestamptz NULL | |
| createdAt | timestamptz | |

Flux : webhook reçu → transaction marquée `COMPLETED` → action métier :
`activatedAt` (création) / `paymentStatus=PAID` (adhésion) / cotisation /
déboursement.

---

### 3.7 `departure_requests` (nouveau — départ sans cagnotte reçue)

Source frontend : `DepartureRequest` (`models.ts:604`).

Un membre qui a cotisé N tours **sans jamais recevoir de cagnotte** peut
demander à quitter. Le fondateur **approuve SANS ajouter de membre** → les
cagnottes sont recalculées. Ceux qui ont bénéficié de ses tours le
remboursent (main à main, la ventilation est affichée, non tracée).

| Colonne | Type | Notes |
|---|---|---|
| id | text PK | |
| circleId | FK → circles | |
| userId | FK → users | Le membre qui veut partir |
| memberName | text | Nom affiché (fondateur) |
| status | enum | `PENDING \| APPROVED \| REJECTED` |
| pastTurns | int | Tours déjà cotisés sans cagnotte reçue |
| totalRecover | int | `pastTurns × cotisation` à récupérer |
| reimbursements | jsonb | `[{ turnNumber, beneficiaryName, amount }]` — qui rembourse quoi |
| recalculatedContribution | int NULL | Nouvelle cotisation par membre restant (à l'approbation) |
| createdAt / decidedAt | timestamptz | |
| rejectionReason | text NULL | |

> Règle : le membre doit avoir `hasReceivedPayout = false` pour pouvoir
> partir. À l'approbation, `memberCount -= 1` et la nouvelle cotisation =
> `ceil(memberCount × cotisation / (memberCount - 1))` (le pot reste entier).

---

### 3.8 Tables non modifiées (référence)

`cycles`, `memberships`, `solidarity_requests`, `aid_votes`, `chat_messages`,
`app_notifications`, `reliability_events`, `turn_validations`, `admins`,
`audit_logs`, `refresh_tokens`.

---

## 4. Récapitulatif des migrations Prisma à appliquer

1. `Circle.activatedAt DateTime?`
2. `Circle.rules Json`
3. `CircleType` += `NATURE`, `AID_APPEAL`
4. `MembershipRequest` += `selfieUrl`, `paymentStatus`, `paymentReference`, `paidAt`
5. `LedgerEntry` += `userId?`, `memberName?`, `proofUrl?`
6. `TransactionType` += `CIRCLE_CREATION_FEE`
7. `MobileMoneyProvider` += `WAVE`
8. Modèle `Webhook` (nouveau)
9. Modèle `DepartureRequest` (nouveau — voir §3.7)

---

## 5. Points d'attention

- **USSD simulé côté frontend** : `buildUssdCode(operator, amount)` +
  `Linking.openURL('tel:...')` → délai fixe (~6 s) → validation. Le backend
  réel remplacera ce délai par l'événement webhook.
- **`activatedAt` absent = cercle non actif** : l'API de listing doit filtrer
  `activatedAt IS NOT NULL AND isActive = true`.
- **Hybride** : le calcul du `joiningFee` doit ignorer la caisse de solidarité
  des tours passés (règle appliquée dans `buildConditionsText` frontend).
- **KYC gate création** : seul un `users.kycStatus = VERIFIED` peut créer un
  cercle (400 sinon).
- **Départ sans cagnotte** : le membre bloque tant que `hasReceivedPayout =
  true` (anti-fuite). Sinon, l'approbation recalcule les cagnottes et les
  bénéficiaires remboursent main à main (non tracé pour l'instant).
