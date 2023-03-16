import { getAllOpenBets, getAllClosedBets } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const open_bets = await getAllOpenBets();
	const closed_bets = await getAllClosedBets();

	if (!open_bets || !closed_bets) return { success: true, user: JSON.stringify(locals) };
	else return { success: true, user: JSON.stringify(locals), open_bets: JSON.stringify(open_bets), closed_bets: JSON.stringify(closed_bets) };
}) satisfies PageServerLoad;
