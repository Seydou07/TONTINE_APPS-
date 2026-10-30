/**
 * VENEGA — Profil utilisateur (démo du site, même principe que
 * venega-mobile/src/features/profile/profileStore.ts).
 *
 * TODO API : `GET /users/me`, `PATCH /users/me` { displayName } ; la photo passera
 * par `POST /uploads` (docs/api-mobile.md, sections 2 et 6).
 */
import { mockCurrentUser } from '@venega/types';
import { emitChange } from '@/lib/demoStore';

export interface UserProfile {
  name: string;
  avatarUrl: string;
  /** Numéro local à 8 chiffres, ex. « 70 12 34 56 ». */
  phone: string;
}

let profile: UserProfile = {
  name: `${mockCurrentUser.firstName} ${mockCurrentUser.lastName}`,
  avatarUrl: '',
  phone: mockCurrentUser.phoneNumber.replace(/^\+226/, '').replace(/(\d{2})(?=\d)/g, '$1 '),
};

export function getProfile(): UserProfile {
  return profile;
}

export function setAvatarUrl(url: string): void {
  profile = { ...profile, avatarUrl: url };
  emitChange();
}

export function setProfileName(name: string): void {
  profile = { ...profile, name: name.trim() || profile.name };
  emitChange();
}

export function setProfilePhone(phone: string): void {
  profile = { ...profile, phone };
  emitChange();
}

export function snapshotProfile(): UserProfile {
  return profile;
}

export function restoreProfile(saved: Partial<UserProfile>): void {
  profile = { ...profile, ...saved };
}
