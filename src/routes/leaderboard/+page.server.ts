import { getLeaders } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const leaders = await getUserSafeLeaders();

	if (!leaders) return { success: true, user: JSON.stringify(locals) };
	else return { success: true, user: JSON.stringify(locals), leaders: JSON.stringify(leaders) };
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
