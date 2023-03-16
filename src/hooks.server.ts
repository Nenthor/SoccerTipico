import { getUser } from '$lib/server/database';
import { getSessionManger } from '$lib/server/session';
import { redirect, type Handle } from '@sveltejs/kit';
import config from '$lib/server/data/config.json' assert { type: 'json' };

import('$lib/server/database'); // Connect with Pocketbase
import('$lib/server/session'); // Connect with Redis

const sessionManger = getSessionManger();

const noAuthRequiredRoutes = ['/authentication', '/api/register', '/api/login'];
export const handle: Handle = (async ({ event, resolve }) => {
	const userSession = await sessionManger.getSession(event.cookies);

	if (noAuthRequiredRoutes.includes(event.url.pathname)) {
		if (!userSession.error) {
			if (event.request.method != 'GET') return new Response(JSON.stringify({ success: false, message: 'Nicht berechtigt.' }), { status: 401 });
			throw redirect(307, '/dashboard');
		}
	} else {
		if (userSession.error) {
			if (event.request.method != 'GET') return new Response(JSON.stringify({ success: false, message: 'Nicht berechtigt.' }), { status: 401 });
			throw redirect(307, '/authentication');
		}

		//Is authanticated
		const user = await getUser(userSession.data.userID);

		if (user) {
			event.locals = {
				userID: user.id,
				username: user.username,
				bets: user.bets,
				total_points: user.total_points,
				points: user.points,
				default_points: config.defaultPoints,
				isAdmin: user.isAdmin
			};
		}
	}

	return resolve(event);
}) satisfies Handle;
