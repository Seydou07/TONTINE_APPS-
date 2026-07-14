/**
 * VENEGA — DTOs (Data Transfer Objects)
 * Définit les formes de données envoyées/reçues par l'API.
 * Utilisé pour valider les formulaires côté frontend (React Hook Form + Zod).
 */

import { CircleType, Frequency, EventType, ContributionMode } from './enums';

/** Inscription — envoi du numéro de téléphone */
export interface RegisterDto {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** Connexion */
export interface LoginDto {
  phoneNumber: string;
  password: string;
}

/** Vérification OTP */
export interface VerifyOtpDto {
  phoneNumber: string;
  code: string;
}

/** Mise à jour du profil */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
}

/** Soumission KYC */
export interface SubmitKycDto {
  idDocumentUrl: string;
  selfieUrl: string;
  documentType: 'CNIB' | 'PASSPORT';
}

/** Création d'un cercle */
export interface CreateCircleDto {
  name: string;
  type: CircleType;
  tontineAmount?: number;
  solidarityAmount?: number;
  frequency: Frequency;
  contributionMode?: ContributionMode;
  beneficiariesPerTurn?: number;
}

/** Rejoindre un cercle via un code d'invitation */
export interface JoinCircleDto {
  inviteCode: string;
}

/** Paiement d'une cotisation */
export interface PayContributionDto {
  circleId: string;
  cycleId: string;
  amount: number;
  /** Opérateur mobile money choisi */
  provider: 'ORANGE_MONEY' | 'MOOV_MONEY';
  phoneNumber: string;
}

/** Soumission d'une demande d'aide */
export interface SubmitAidRequestDto {
  circleId: string;
  cycleId: string;
  eventType: EventType;
  reason: string;
  amountRequested: number;
  proofUrl?: string;
}

/** Vote sur une demande d'aide */
export interface VoteAidRequestDto {
  requestId: string;
  approved: boolean;
}

/** Déclenchement d'un reversement (Cash-Out) */
export interface InitiatePayoutDto {
  circleId: string;
  cycleId: string;
  beneficiaryUserId: string;
  amount: number;
}

/** Envoi d'un message dans le chat */
export interface SendMessageDto {
  circleId: string;
  content: string;
}

/** Réponse d'authentification */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: import('./models').User;
}

/** Réponse paginée générique */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
