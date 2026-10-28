/**
 * VENEGA — Store local du profil utilisateur (démo frontend)
 *
 * Module-level mutable state, sur le même principe que circleStore.ts.
 * Permet à ProfileScreen et ProfilePhotoScreen de partager la photo de
 * profil en attendant que l'API expose l'upload et la mise à jour du profil.
 */

export interface UserProfile {
  name: string;
  avatarUrl: string;
}

let profile: UserProfile = {
  name: 'Aminata Ouédraogo',
  avatarUrl: '',
};

export function getProfile(): UserProfile {
  return profile;
}

export function setAvatarUrl(url: string): void {
  profile = { ...profile, avatarUrl: url };
}

export function setProfileName(name: string): void {
  profile = { ...profile, name: name.trim() || profile.name };
}

/** Sauvegarde locale (voir `src/lib/persistence.ts`). */
export function snapshotProfile(): UserProfile {
  return profile;
}

export function restoreProfile(saved: UserProfile): void {
  profile = { ...profile, ...saved };
}
