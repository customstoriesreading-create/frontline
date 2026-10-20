import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { permissionsFor, resolveAccessLevel } from '@/lib/roles';

const CurrentUserContext = createContext(null);

export function useCurrentUserContext() {
  return useContext(CurrentUserContext);
}

/**
 * One auth lookup for the whole app: the signed-in teammate, their access level
 * and what that level allows. The app stays usable when nobody is signed in.
 */
export function CurrentUserProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    let active = true;
    base44.auth
      .me()
      .then((user) => {
        if (active) setState({ user, loading: false });
      })
      .catch(() => {
        if (active) setState({ user: null, loading: false });
      });
    return () => {
      active = false;
    };
  }, []);

  const accessLevel = resolveAccessLevel(state.user);

  return (
    <CurrentUserContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        accessLevel,
        permissions: permissionsFor(accessLevel),
        suspended: Boolean(state.user?.suspended),
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}