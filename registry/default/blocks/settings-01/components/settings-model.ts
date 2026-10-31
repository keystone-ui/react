/**
 * The rules behind settings-01, separate from the UI so they can be tested.
 */

export interface Profile {
  email: string;
  name: string;
}

export interface Session {
  current: boolean;
  device: string;
  id: string;
  lastActive: string;
  location: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Field errors for a profile draft; an empty object means it can be saved. */
export function validateProfile(
  profile: Profile
): Partial<Record<keyof Profile, string>> {
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (profile.name.trim().length === 0) {
    errors.name = "Enter your name.";
  }
  if (!EMAIL_RE.test(profile.email.trim())) {
    errors.email = "Enter an email address like name@example.com.";
  }
  return errors;
}

/** The fields a draft changes, ignoring whitespace the user cannot see. */
export function changedFields(
  saved: Profile,
  draft: Profile
): (keyof Profile)[] {
  return (Object.keys(saved) as (keyof Profile)[]).filter(
    (key) => saved[key].trim() !== draft[key].trim()
  );
}

/**
 * Deleting an account asks for its email typed back, case-insensitively,
 * so the destructive button is a deliberate act rather than a reflex.
 */
export function confirmsDeletion(email: string, typed: string): boolean {
  return typed.trim().toLowerCase() === email.trim().toLowerCase();
}

/** Every session except the current one — "Sign out other sessions". */
export function otherSessions(sessions: readonly Session[]): Session[] {
  return sessions.filter((s) => !s.current);
}
