import { getUser } from '$lib/server/database';
import { getSessionManger } from '$lib/server/session';
import { error, redirect, type Cookies, type Handle } from '@sveltejs/kit';
import config from '$lib/server/data/config.json' assert { type: 'json' };
import { setupWebsocketServer } from '$lib/server/websocket';

import('$lib/server/database'); // Connect with Pocketbase
import('$lib/server/session'); // Connect with Redis
import('$lib/server/websocket'); // Setup Websocket-Server

const sessionManger = getSessionManger();
let firstConnection = false;

const noAuthAllowedRoutes = ['/authentication', '/api/register', '/api/login'];
const alwaysAllowedRouts = ['/datenschutz'];
const adminRoutes = ['/admin', '/admin/user', '/admin/newbet', '/admin/bet', '/api/bet/create', '/api/bet/answer', '/api/user/ban', '/api/user/giveall', '/api/user/rename'];
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
			} else if (rateLimitBurst(event.cookies)) throw error(429, { message: 'Too Many Requests' });

			//Is authenticated
			const user = await getUser(userSession.data.userID);

			if (!user) {
				const { error } = await sessionManger.delSession(event.cookies);
				if (error) await sessionManger.deleteCookie(event.cookies);
				throw redirect(307, '/authentication');
			}

			if (adminRoutes.includes(event.url.pathname) && !user.isAdmin) {
				if (event.request.method != 'GET') return new Response(JSON.stringify({ success: false, message: 'Nicht berechtigt.' }), { status: 401 });
				throw redirect(307, '/dashboard');
			} else if (event.url.pathname != '/banned' && user.isBanned) {
				if (!(event.request.method == 'POST' && event.url.pathname == '/api/logout')) {
					if (event.request.method != 'GET') return new Response(JSON.stringify({ success: false, message: 'Nicht berechtigt.' }), { status: 401 });
					throw redirect(307, '/banned');
				}
			} else if (event.url.pathname == '/banned' && !user.isBanned) {
				if (event.request.method != 'GET') return new Response(JSON.stringify({ success: false, message: 'Nicht berechtigt.' }), { status: 401 });
				throw redirect(307, '/dashboard');
			}

			event.locals = {
				id: user.id,
				username: user.username,
				bets: user.bets,
				history: user.history,
				total_points: user.total_points,
				points: user.points,
				default_points: config.defaultPoints,
				isBanned: user.isBanned,
				isAdmin: user.isAdmin
			};
		}
	}

	return resolve(event);
}) satisfies Handle;

function onFirstConnection(port: number) {
	if (!port || port == 443) port = 8080;
	setupWebsocketServer(port - 10);
}
function rateLimitBurst(cookies: Cookies) {
	const request_count = cookies.get('request_count');

	if (!request_count) {
		cookies.set('request_count', '0', {
			secure: true,
			path: '/',
			maxAge: 3 // 3s
		});
	} else {
		const request_count_int = parseInt(request_count);
		if (isNaN(request_count_int) || request_count_int > 10) return true;
		cookies.set('request_count', `${request_count_int + 1}`, {
			secure: true,
			path: '/',
			maxAge: 3 // 3s
		});
	}

	return false;
}
