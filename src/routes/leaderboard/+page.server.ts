import { getLeaders } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const leaders = await getLeaders();

	if (!leaders) return { success: true, user: JSON.stringify(locals) };
	else return { success: true, user: JSON.stringify(locals), leaders: JSON.stringify(leaders) };
}) satisfies PageServerLoad;
