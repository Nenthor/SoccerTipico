import { getUser } from '$lib/server/database';
import { getSessionManger } from '$lib/server/session';
import { redirect, type Handle } from '@sveltejs/kit';

import('$lib/server/database'); // Connect with Pocketbase
import('$lib/server/session'); // Connect with Redis

const sessionManger = getSessionManger();

const noAuthRequiredRoutes = ['/authentication', '/api/register', '/api/login'];
export const handle: Handle = (async ({ event, resolve }) => {
	if (event.request.method != 'GET') return resolve(event);

	const userSession = await sessionManger.getSession(event.cookies);

	if (noAuthRequiredRoutes.includes(event.url.pathname)) {
		if (!userSession.error) throw redirect(307, '/dashboard');
	} else {
		if (userSession.error) throw redirect(307, '/authentication?type=register');

		//Is authanticated
		const user = await getUser(userSession.data.userID);

		if (user) {
			event.locals = {
				userID: user.id,
				username: user.username,
				bets: user.bets,
				points: user.points
			};
		}
	}

	return resolve(event);
}) satisfies Handle;
