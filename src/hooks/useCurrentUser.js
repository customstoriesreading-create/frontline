import { useCurrentUserContext } from '@/lib/currentUserContext';
import { ACCESS_STAFF, permissionsFor } from '@/lib/roles';

const FALLBACK = {
  user: null,
  loading: true,
  accessLevel: ACCESS_STAFF,
  permissions: permissionsFor(ACCESS_STAFF),
  suspended: false,
};

/**
 * The signed-in teammate and what their access level allows. Reads from the app's
 * current-user provider so every screen agrees on who is signed in.
 */
export default function useCurrentUser() {
  return useCurrentUserContext() || FALLBACK;
}