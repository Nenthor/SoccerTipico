import { getBet } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const bet_id = url.searchParams.get('id');
	const view = url.searchParams.get('view') == 'true';
	const bet = bet_id != null ? await getBet(bet_id) : null;

	if (!bet_id || !bet) return { success: false };

	return { success: true, bet: JSON.stringify(bet), user: JSON.stringify(locals), view: `${view}` };
}) satisfies PageServerLoad;
