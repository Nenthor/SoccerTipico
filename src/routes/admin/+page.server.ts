import { getAllUsers, getAllBets } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const users = await getAllUsers();
	const bets = await getAllBets();

	if ((!users && !bets) || (!users || !bets)) return { success: true, user: JSON.stringify(locals) };
	else return { success: true, user: JSON.stringify(locals), users: JSON.stringify(users), bets: JSON.stringify(bets) };
}) satisfies PageServerLoad;

