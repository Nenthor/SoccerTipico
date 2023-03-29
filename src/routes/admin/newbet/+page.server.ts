import { getAllOpenMatches } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const matches = await getAllOpenMatches();

	if (!matches) return { success: false };
	return { success: true, matches: JSON.stringify(matches), self: JSON.stringify(locals) };
}) satisfies PageServerLoad;
