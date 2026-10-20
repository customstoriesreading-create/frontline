export const ACCESS_OWNER = 'owner';
export const ACCESS_MANAGER = 'manager';
export const ACCESS_STAFF = 'staff';

export const ACCESS_LEVELS = [ACCESS_OWNER, ACCESS_MANAGER, ACCESS_STAFF];

export const ACCESS_LABELS = {
  [ACCESS_OWNER]: 'Owner',
  [ACCESS_MANAGER]: 'Manager',
  [ACCESS_STAFF]: 'Staff',
};

export const ACCESS_SUMMARIES = {
  [ACCESS_OWNER]: 'Full control of vehicles and people, plus complete insight.',
  [ACCESS_MANAGER]: 'Runs the lot, with insight into stock, brands and trends.',
  [ACCESS_STAFF]: 'Adds vehicles, keeps statuses current and messages the team.',
};

const MATRIX = {
  [ACCESS_OWNER]: {
    insight: 'full',
    team: true,
    deleteVehicle: true,
    editAnyVehicle: true,
    messages: true,
  },
  [ACCESS_MANAGER]: {
    insight: 'limited',
    team: false,
    deleteVehicle: false,
    editAnyVehicle: true,
    messages: true,
  },
  [ACCESS_STAFF]: {
    insight: 'none',
    team: false,
    deleteVehicle: false,
    editAnyVehicle: false,
    messages: true,
  },
};

/**
 * Frontline roles sit on top of the platform's built-in roles: an app admin is a
 * dealership owner, everyone else signed in is staff until an owner sets their
 * access level from the team screen.
 */
export function resolveAccessLevel(user) {
  if (!user) return ACCESS_STAFF;
  if (ACCESS_LABELS[user.access_level]) return user.access_level;
  return user.role === 'admin' ? ACCESS_OWNER : ACCESS_STAFF;
}

export function permissionsFor(accessLevel) {
  return MATRIX[accessLevel] || MATRIX[ACCESS_STAFF];
}