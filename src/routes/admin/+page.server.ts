import { getAllUsers, getAllBets, getAllTeams, getAllMatches } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const users = await getAllUsers(true);
	const bets = await getAllBets();
	const teams = await getAllTeams();
	const matches = await getAllMatches();

	if (!users || !bets || !teams || !matches) return { success: true, user: JSON.stringify(locals) };
	else return { success: true, user: JSON.stringify(locals), users: JSON.stringify(users), bets: JSON.stringify(bets), teams: JSON.stringify(teams), matches: JSON.stringify(matches) };
}) satisfies PageServerLoad;
