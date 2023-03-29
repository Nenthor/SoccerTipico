import { getAllTeams } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const teams = await getAllTeams();

	if (!teams) return { success: false };
	return { success: true, teams: JSON.stringify(teams), self: JSON.stringify(locals) };
}) satisfies PageServerLoad;
