import { getMatch } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const match_id = url.searchParams.get('id');
	const match = match_id != null ? await getMatch(match_id) : null;

	if (!match_id || !match) return { success: false };

	return { success: true, match: JSON.stringify(match), self: JSON.stringify(locals) };
}) satisfies PageServerLoad;
