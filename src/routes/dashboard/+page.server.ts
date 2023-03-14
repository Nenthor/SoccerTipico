import { getAllOpenBets } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const open_bets = await getAllOpenBets();

	if (!open_bets) return { success: true, user: JSON.stringify(locals) };
	else return { success: true, user: JSON.stringify(locals), open_bets: JSON.stringify(open_bets) };
}) satisfies PageServerLoad;
