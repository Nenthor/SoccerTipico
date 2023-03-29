import { getBet } from '$lib/server/database';
import { getPanelData } from '$lib/server/settings';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const bet_id = url.searchParams.get('id');
	const bet = bet_id != null ? await getBet(bet_id) : null;

	if (!bet_id || !bet) return { success: false };

	const panel_data1 = getPanelData('1');
	const panel_data2 = getPanelData('2');
	let panel = -1;

	if (panel_data1 && panel_data1.bet?.id == bet.id) {
		panel = 1;
	}
	if (panel_data2 && panel_data2.bet?.id == bet.id) {
		if (panel == 1) panel = 3;
		else panel = 2;
	}

	return { success: true, bet: JSON.stringify(bet), self: JSON.stringify(locals), panel: panel.toString() };
}) satisfies PageServerLoad;
