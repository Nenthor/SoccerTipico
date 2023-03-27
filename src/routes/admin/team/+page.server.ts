import { getTeam } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const team_id = url.searchParams.get('id');
	const team = team_id != null ? await getTeam(team_id) : null;

	if (!team_id || !team) return { success: false };

	return { success: true, team: JSON.stringify(team), self: JSON.stringify(locals) };
}) satisfies PageServerLoad;
