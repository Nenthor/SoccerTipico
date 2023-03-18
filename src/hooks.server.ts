import { getUser } from '$lib/server/database';
import { getSessionManger } from '$lib/server/session';
import { redirect, type Handle } from '@sveltejs/kit';
import config from '$lib/server/data/config.json' assert { type: 'json' };
import { sendAll, sendToBet, sendToDashboard, sendToLeaderboard, setupWebsocketServer } from '$lib/server/websocket';

import('$lib/server/database'); // Connect with Pocketbase
import('$lib/server/session'); // Connect with Redis
import('$lib/server/websocket'); // Setup Websocket-Server

const sessionManger = getSessionManger();
let firstConnection = false;

const noAuthAllowedRoutes = ['/authentication', '/api/register', '/api/login'];
const alwaysAllowedRouts = ['/datenschutz'];
export const handle: Handle = (async ({ event, resolve }) => {
	const userSession = await sessionManger.getSession(event.cookies);

	if (!firstConnection) {
		firstConnection = true;
		onFirstConnection(parseInt(event.url.port));
	}

	if (!alwaysAllowedRouts.includes(event.url.pathname)) {
		if (noAuthAllowedRoutes.includes(event.url.pathname)) {
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
	}

	return resolve(event);
}) satisfies Handle;

function onFirstConnection(port: number) {
	if (!port || port == 443) port = 8080;
	setupWebsocketServer(port - 10);
}
