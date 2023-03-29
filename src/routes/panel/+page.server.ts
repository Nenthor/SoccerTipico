import { getLeaders } from '$lib/server/database';
import { getPanelData } from '$lib/server/settings';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const leaders = await getUserSafeLeaders();
	const panel_id = url.searchParams.get('id');

	if (!leaders) return { success: true, user: JSON.stringify(locals) };
	if (!panel_id) return { success: true, user: JSON.stringify(locals), leaders: JSON.stringify(leaders) };
	else return { success: true, user: JSON.stringify(locals), leaders: JSON.stringify(leaders), panel_data: JSON.stringify(getPanelData(panel_id)) };
}) satisfies PageServerLoad;

async function getUserSafeLeaders() {
	const leaders_server = await getLeaders();
	if (!leaders_server) return null;

	let leaders = [];
	for (const leader of leaders_server) {
		leaders.push({
			username: leader.username,
			total_points: leader.total_points
		});
	}
	return leaders;
}
