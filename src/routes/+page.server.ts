import { getSessionManger } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const userSession = await getSessionManger().getSession(event.cookies);
	console.log(userSession.message);
	if (!userSession.error) throw redirect(308, '/dashboard');
	else throw redirect(308, '/authentication?type=register');
}) satisfies PageServerLoad;
