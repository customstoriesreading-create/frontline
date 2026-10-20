import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ACCESS_LEVELS = ['owner', 'manager', 'staff'];

/**
 * Owners set a teammate's access level or suspend them. Access levels live on a
 * field app users cannot edit themselves, so the change is made with the
 * service-role client after checking the caller really is an owner (app admin).
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Only owners can change access levels' }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) || {};
    const userId = body.user_id;
    const accessLevel = body.access_level;
    const suspended = body.suspended;

    if (!userId) return Response.json({ error: 'user_id is required' }, { status: 400 });
    if (accessLevel !== undefined && !ACCESS_LEVELS.includes(accessLevel)) {
      return Response.json({ error: 'Unknown access level' }, { status: 400 });
    }
    if (suspended !== undefined && typeof suspended !== 'boolean') {
      return Response.json({ error: 'suspended must be true or false' }, { status: 400 });
    }

    const target = await base44.asServiceRole.entities.User.get(userId);
    if (!target) return Response.json({ error: 'Teammate not found' }, { status: 404 });

    const targetIsOwner = target.access_level ? target.access_level === 'owner' : target.role === 'admin';
    if (suspended === true && targetIsOwner) {
      return Response.json({ error: 'Owners cannot be suspended' }, { status: 403 });
    }

    const patch = {};
    if (accessLevel !== undefined) {
      patch.access_level = accessLevel;
      patch.role = accessLevel === 'owner' ? 'admin' : 'user';
    }
    if (suspended !== undefined) patch.suspended = suspended;

    const updated = await base44.asServiceRole.entities.User.update(userId, patch);
    return Response.json({
      id: updated.id,
      email: updated.email,
      access_level: updated.access_level,
      role: updated.role,
      suspended: Boolean(updated.suspended),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}