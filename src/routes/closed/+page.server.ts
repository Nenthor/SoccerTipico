import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return { success: true, user: JSON.stringify(locals) };
}) satisfies PageServerLoad;
