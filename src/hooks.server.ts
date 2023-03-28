import { getUser } from '$lib/server/database';
import { sessionManager } from '$lib/server/session';
import { redirect, type Cookies, type Handle } from '@sveltejs/kit';
import config from '$lib/server/data/config.json' assert { type: 'json' };
import { setupWebsocketServer } from '$lib/server/websocket';
import { settings } from '$lib/server/settings';

import('$lib/server/database'); // Connect with Pocketbase
import('$lib/server/session'); // Connect with Redis
import('$lib/server/websocket'); // Setup Websocket-Server

let firstConnection = false;

const noAuthAllowedRoutes = ['/authentication', '/api/register', '/api/login'];
const alwaysAllowedRouts = ['/datenschutz', '/error'];
const adminRoutes = [
	'/admin',
	'/admin/user',
	'/admin/newbet',
	'/admin/bet',
	'/admin/newteam',
	'/admin/team',
	'/admin/newmatch',
	'/admin/match',
	'/api/bet/create',
	'/api/bet/answer',
	'/api/bet/newtime',
	'/api/user/ban',
	'/api/user/delete',
	'/api/user/giveall',
	'/api/user/rename',
	'/api/user/status',
	'/api/user/globalreset',
	'/api/team/create',
	'/api/team/delete',
	'/api/match/create',
	'/api/match/finish',
	'/api/match/update'
];
export const handle: Handle = (async ({ event, resolve }) => {
	const userSession = await sessionManager.getSession(event.cookies);

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
			} else if (rateLimitBurst(event.cookies)) throw redirect(307, '/error');

			//Is authenticated
			const user = await getUser(userSession.data.userID);

			if (!user) {
				const { error } = await sessionManager.delSession(event.cookies);
				if (error) await sessionManager.deleteCookie(event.cookies);
				throw redirect(307, '/authentication');
			} else if (adminRoutes.includes(event.url.pathname) && !user.isAdmin) {
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
			} else if (!settings.public && !user.isBanned && !user.isAdmin && event.url.pathname != '/closed') throw redirect(307, '/closed');
			else if (settings.public && !user.isBanned && event.url.pathname == '/closed') throw redirect(307, '/dashboard');

			event.locals = {
				id: user.id,
				username: user.username,
				bets: user.bets,
				history: user.history,
				created: user.created,
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
			maxAge: 1 // 3s
		});
	} else {
		const request_count_int = parseInt(request_count);
		if (isNaN(request_count_int) || request_count_int > 5) return true;
		cookies.set('request_count', `${request_count_int + 1}`, {
			secure: true,
			path: '/',
			maxAge: 1 // 3s
		});
	}

	return false;
}
