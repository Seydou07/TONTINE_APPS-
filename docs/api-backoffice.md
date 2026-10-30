# API attendue par le back-office Venega

Destinataire : responsable de `venega-api`.
Base : `/api/v1/admin`, JWT **admin** (distinct des comptes utilisateurs) en `Authorization: Bearer`. Montants en F CFA entiers. Téléphones au format `+226XXXXXXXX`.

Le back-office (`venega-backoffice`) fonctionne aujourd'hui sur des données simulées (`src/mocks/db.ts`). Chaque fonction de `src/features/<x>/api.ts` porte un commentaire `TODO API` qui décrit l'appel à brancher ; ce document les regroupe.

---

## Back-office

### Règles transverses (côté serveur, obligatoires)

1. **Rôles et moindre privilège.** Quatre rôles : `SUPER_ADMIN`, `SUPPORT`, `KYC_AGENT`, `FINANCE`. La matrice est dans `venega-backoffice/src/features/auth/permissions.ts`. Le back-office **masque** les actions selon le rôle, mais ce contrôle côté client ne protège rien : chaque route doit vérifier le rôle (garde NestJS) et répondre `403`. Les refus sont journalisés.
2. **Journal d'audit en ajout seul.** Toute action qui modifie quelque chose écrit une entrée : admin, rôle, date, action, type et identifiant de la cible, objets liés, **motif**, état **avant / après**. Aucune modification ni suppression possible, même par un super admin. Le modèle Prisma `AuditLog` doit gagner `reason`, `before`, `after`, `relatedIds`.
3. **Motif obligatoire** sur toute action sensible (minimum 5 ou 10 caractères selon l'action, voir les fonctions mock). Refuser une requête sans motif.
4. **Jamais de mot de passe saisi par un admin.** La réinitialisation envoie un code à usage unique à l'utilisateur.
5. **Changement de numéro** : KYC `VERIFIED` exigé, numéro de pièce dicté par l'appelant comparé à celui du KYC, nouveau numéro libre, révocation de toutes les sessions, SMS au nouveau numéro, ancien numéro conservé dans l'historique.
6. **Rapprochement manuel** : la référence opérateur saisie doit être identique à celle reçue ; le serveur **revérifie le statut auprès de CinetPay** ; le montant n'est jamais modifié ; refus si la cotisation est déjà payée ou si le cercle est gelé.
7. **Cercle gelé (`FROZEN`)** : refuse toute cotisation, tout versement, tout décaissement, côté app mobile comme côté admin.
8. **Remboursements** : principe des quatre yeux (celui qui approuve n'est pas celui qui a demandé). Non simulé dans la démo, à imposer côté serveur.
9. **Données personnelles** : URL de documents KYC signées et courtes (5 min), accès journalisé, réservé à `KYC_AGENT` et `SUPER_ADMIN`.

### Authentification

| Appel | Notes |
|---|---|
| `POST /auth/login` `{ email, password }` → `{ accessToken, admin: { id, name, role } }` | Limite de tentatives, 2FA recommandée |
| `POST /auth/logout` | |
| `GET /team` → `[{ id, name, role }]` | Assignation des tickets. Jamais d'e-mail ni de secret |

### Recherche et tableau de bord

| Appel | Notes |
|---|---|
| `GET /search?q=` → `{ users, circles, payments, fundraisers, tickets }` | 6 résultats max. par groupe. Numéro avec ou sans `+226`/`00226`, avec ou sans espaces, partiel (4 chiffres min.) ; nom ; nom de cercle ; code d'invitation ; référence `VP-…` ; référence opérateur ; code de cagnotte ; numéro de ticket `T-…` |
| `GET /dashboard/work-queue` | Compteurs « à traiter » (voir `WorkQueue` dans `features/dashboard/api.ts`) : KYC en attente et plus ancien, paiements non rattachés, versements en retard, remboursements ouverts, solidarité bloquée, tickets, retards, demandes, comptes bloqués, alertes, cagnottes signalées |

### Utilisateurs

| Appel | Rôles |
|---|---|
| `GET /users?kycStatus=&accountStatus=&locked=&q=&page=&pageSize=` | tous |
| `GET /users/:id` — profil, sécurité (téléphone vérifié, échecs, verrouillage, codes SMS 24 h et statut de livraison, jeton push), cercles avec rôle / ordre / statut de paiement, versements reçus, alertes, sessions, dernier KYC | tous |
| `GET /users/:id/notifications?status=&page=&pageSize=` — journal d'envoi Expo Push + agrégateur SMS, avec motif d'échec | tous |
| `POST /users/:id/resend-otp` — limite 5 codes / 24 h | SUPER_ADMIN, SUPPORT |
| `POST /users/:id/unlock` `{ reason }` | SUPER_ADMIN, SUPPORT |
| `POST /users/:id/password-reset` `{ reason }` — code à usage unique (10 min) | SUPER_ADMIN, SUPPORT |
| `POST /users/:id/logout-all` `{ reason }` — révoque les jetons de rafraîchissement | SUPER_ADMIN, SUPPORT |
| `POST /users/:id/change-phone` `{ newPhone, documentNumber, reason }` | SUPER_ADMIN, SUPPORT |
| `POST /users/:id/suspend` `{ reason }` — révoque aussi les sessions | SUPER_ADMIN, SUPPORT |
| `POST /users/:id/reactivate` `{ reason }` | SUPER_ADMIN, SUPPORT |

### KYC

| Appel | Rôles |
|---|---|
| `GET /kyc/submissions?status=PENDING&q=&page=&pageSize=` — tri : signalés puis plus anciens | tous (documents : KYC_AGENT, SUPER_ADMIN) |
| `GET /kyc/submissions/:id` | idem |
| `GET /kyc/stats`, `GET /kyc/decisions?q=&page=&pageSize=` | tous |
| `POST /kyc/submissions/:id/approve` | SUPER_ADMIN, KYC_AGENT |
| `POST /kyc/submissions/:id/reject` `{ reason }` | SUPER_ADMIN, KYC_AGENT |

### Cercles

| Appel | Rôles |
|---|---|
| `GET /circles?type=&status=&late=true&overduePayout=true&q=&page=&pageSize=` — filtres : type, avec retards, versement en retard, demandes en attente, solidarité bloquée, gelés | tous |
| `GET /circles/counts` | tous |
| `GET /circles/:id` (+ `/contributions` grille membres × tours, `/payouts`, `/requests`, `/turn-order-history`, `/events`, `/solidarity`) | tous |
| `GET /requests?type=&status=&userId=` | tous |
| `POST /circles/:id/freeze` `{ reason }`, `POST /circles/:id/unfreeze` `{ reason }` | SUPER_ADMIN, SUPPORT |
| `POST /circles/:id/transfer-founder` `{ newFounderUserId, reason }` — membre actif, compte non suspendu | SUPER_ADMIN, SUPPORT |
| `PATCH /circles/:id/members/:userId/turn-order` `{ turnOrder, reason }` — échange avec le titulaire, tours à venir uniquement | SUPER_ADMIN, SUPPORT |
| `POST /circles/:id/reminders` `{ userIds? }` — SMS + push, 1 par membre / 24 h | SUPER_ADMIN, SUPPORT, FINANCE |
| `POST /circles/requests/:requestId/decide` `{ decision: APPROVE \| REJECT \| CANCEL_EXCLUSION \| CONFIRM_EXCLUSION, reason }` | SUPER_ADMIN, SUPPORT |
| `POST /payouts/:id/retry` `{ destination?, reason }` — versement refusé par l'opérateur | SUPER_ADMIN, FINANCE |
| `POST /payouts/:id/execute` `{ reason }` — à la place du fondateur ; toutes les cotisations du tour payées, cercle non gelé | SUPER_ADMIN, FINANCE |
| `POST /solidarity/requests/:id/close-vote` `{ outcome: APPROVED \| REJECTED, reason }` — vote dont l'échéance est passée | SUPER_ADMIN, FINANCE |
| `POST /solidarity/requests/:id/disburse` `{ reason }` — refusé si solde insuffisant ou cercle gelé ; argent vers le numéro du bénéficiaire uniquement | SUPER_ADMIN, FINANCE |

Données à ajouter au schéma Prisma pour ces écrans : statut `FROZEN` du cercle (+ `frozenReason`, `frozenAt`), statut du membre (`ACTIVE`, `EXCLUDED`, `LEFT`), historique des changements d'ordre de passage (`TurnOrderChange`), exclusion contestée, statut de versement par tour (`WAITING`, `READY`, `PROCESSING`, `PAID`, `FAILED` + motif d'échec), échéance de vote des demandes de solidarité.

### Paiements et remboursements

| Appel | Rôles |
|---|---|
| `GET /payments?status=&unmatched=true&direction=&userId=&circleId=&q=&page=&pageSize=` — avec référence Venega, référence opérateur, opérateur, numéro payeur, heure, motif d'échec ou de non-rattachement | tous |
| `GET /payments/counts` | tous |
| `GET /payments/:id/match-candidates?q=` — cotisations impayées proches (même compte, numéro, cercle, montant) | SUPER_ADMIN, FINANCE |
| `POST /payments/:id/reconcile` `{ circleId, userId, turn, providerReference, reason }` | SUPER_ADMIN, FINANCE |
| `GET /refunds?status=&userId=&q=&page=&pageSize=` | tous |
| `POST /refunds` `{ paymentId, reason }` | SUPER_ADMIN, SUPPORT, FINANCE |
| `POST /refunds/:id/approve` \| `/reject` \| `/execute` `{ note }` — `execute` = cash-out CinetPay | SUPER_ADMIN, FINANCE |

Un paiement entrant `COMPLETED` sans cotisation associée doit être stocké comme « non rattaché » avec la raison (numéro payeur inconnu, montant différent, confirmation tardive, double paiement…), et non ignoré.

### Cagnottes d'aide publiques

| Appel | Rôles |
|---|---|
| `GET /fundraisers?status=&reported=true&q=&page=&pageSize=`, `GET /fundraisers/counts`, `GET /fundraisers/:id` (avec signalements, montant déjà retiré, gel des retraits) | tous |
| `POST /fundraisers/:id/activate`, `/suspend` `{ reason }`, `/reactivate` `{ note? }`, `/close` `{ reason }` — suspendre gèle aussi les retraits | SUPER_ADMIN, SUPPORT |
| `POST /fundraisers/:id/freeze-withdrawals` `{ reason }`, `/unfreeze-withdrawals` `{ reason }` | SUPER_ADMIN, SUPPORT, FINANCE |

### Alertes de fraude

| Appel | Rôles |
|---|---|
| `GET /alerts?status=OPEN&severity=&q=&page=&pageSize=`, `GET /alerts/counts` | tous |
| `POST /alerts/:id/resolve` `{ note }` | SUPER_ADMIN, SUPPORT, FINANCE |

### Tickets d'appel et notes du support

| Appel | Rôles |
|---|---|
| `GET /tickets?status=&category=&priority=&assignee=&userId=&circleId=&q=&page=&pageSize=`, `GET /tickets/counts`, `GET /tickets/:id` | tous |
| `POST /tickets` `{ category, priority, description, callerPhone?, userId?, circleId?, fundraiserId?, assignee? }` → numéro lisible `T-…` à donner à l'appelant | tous |
| `PATCH /tickets/:id` `{ status?, assignee?, priority? }` ; `POST /tickets/:id/notes` `{ text }` — résolution refusée sans note | tous |
| `GET /notes?userId=\|circleId=`, `POST /notes` `{ userId?, circleId?, text }` — notes internes, jamais visibles par l'utilisateur | tous |

Catégories de ticket : `PAYMENT_MISSING`, `LOGIN_OTP`, `PHONE_CHANGE`, `ACCOUNT_SUSPENDED`, `KYC`, `PAYOUT_MISSING`, `FOUNDER_ISSUE`, `MEMBERSHIP`, `LATE_MEMBER`, `TURN_ORDER`, `REFUND`, `SOLIDARITY`, `FUNDRAISER_FRAUD`, `NOTIFICATIONS`, `OTHER`. Nouveaux modèles Prisma : `Ticket`, `TicketNote`, `SupportNote`, `Refund`.

### Journal d'audit

| Appel | Rôles |
|---|---|
| `GET /audit-logs?q=&targetType=&subjectId=&page=&pageSize=` — sans `subjectId` : journal complet | complet : SUPER_ADMIN ; par fiche (`subjectId`) : tous |
