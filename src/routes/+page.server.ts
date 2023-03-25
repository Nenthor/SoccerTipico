import { sessionManager } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const userSession = await sessionManager.getSession(event.cookies);

	if (!userSession.error) throw redirect(308, '/dashboard');
	else throw redirect(308, '/authentication');
}) satisfies PageServerLoad;
