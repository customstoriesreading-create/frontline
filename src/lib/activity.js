import { base44 } from '@/api/base44Client';

export const ACTIVITY_LABELS = {
  'vehicle.created': 'Added a vehicle',
  'vehicle.updated': 'Edited a vehicle',
  'vehicle.status': 'Changed a status',
  'vehicle.deleted': 'Removed a vehicle',
  'team.invited': 'Invited a teammate',
  'team.role': 'Changed an access level',
  'team.suspended': 'Suspended a teammate',
  'team.reactivated': 'Reactivated a teammate',
};

export function activityLabel(action) {
  return ACTIVITY_LABELS[action] || 'Activity';
}

export async function logActivity({ user, accessLevel, action, summary, targetType, targetId }) {
  if (!user?.email) return;
  try {
    await base44.entities.Activity.create({
      actor_email: user.email,
      actor_name: user.full_name || user.email,
      access_level: accessLevel,
      action,
      summary,
      target_type: targetType || '',
      target_id: targetId || '',
      date: new Date().toISOString(),
    });
  } catch {
    // The trail must never block the action it describes.
  }
}