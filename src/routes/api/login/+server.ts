import { getUserByName } from '$lib/server/database';
import { getSessionManger } from '$lib/server/session';
import { timingSafeEqual, scryptSync } from 'crypto';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, cookies }) => {
	const username = request.headers.get('username');
	const password = request.headers.get('password');

	if (!username || !password || !checkData(username, password)) {
		return getResponse(false, 'Ungültige Benutzerdaten.');
	}

	const user = await getUserByName(username);

	if (user == null) return getResponse(false, 'Benutzername ist nicht vergeben.');
	if (!checkPassword(password, user.password)) return getResponse(false, 'Ungültiges Passwort.');
	const { error } = await getSessionManger().createNewSession(cookies, { userID: user.id });
	if (error) return getResponse(false, 'Der Server ist momentan überlastet.');

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(username: string, password: string) {
	username = username.trim();
	password = password.trim();
	if (username == '' || password == '') return false;
	else return true;
}

function checkPassword(password: string, hash: string) {
	const [salt, key] = hash.split(':');
	const hashBuffer = scryptSync(password, salt, 64);
	const keyBuffer = Buffer.from(key, 'hex');
	return timingSafeEqual(hashBuffer, keyBuffer);
}
