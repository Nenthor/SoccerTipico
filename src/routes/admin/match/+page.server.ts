import { getMatch } from '$lib/server/database';
import { getPanelData } from '$lib/server/settings';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const match_id = url.searchParams.get('id');
	const match = match_id != null ? await getMatch(match_id) : null;

	if (!match_id || !match) return { success: false };

	const panel_data1 = getPanelData('1');
	const panel_data2 = getPanelData('2');
	let panel = -1;

	if (panel_data1 && panel_data1.match?.id == match.id) {
		panel = 1;
	}
	if (panel_data2 && panel_data2.match?.id == match.id) {
		if (panel == 1) panel = 3;
		else panel = 2;
	}

	return { success: true, match: JSON.stringify(match), self: JSON.stringify(locals), panel: panel.toString() };
}) satisfies PageServerLoad;
