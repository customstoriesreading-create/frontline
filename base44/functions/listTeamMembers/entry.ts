import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * Team directory for messaging: any signed-in teammate may look up who they can
 * write to. Only names and email addresses leave this function — no roles,
 * no suspension state, no other user fields.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.entities.User.list();
    const members = Array.isArray(result) ? result : result?.items || [];
    const directory = members
      .filter((member) => member && member.email && !member.suspended)
      .slice(0, 200)
      .map((member) => ({ email: member.email, full_name: member.full_name || member.email }));

    return Response.json({ directory });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}