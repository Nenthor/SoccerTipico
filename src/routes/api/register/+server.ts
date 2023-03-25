import { createUser, getLowestLeader, getUserByName } from '$lib/server/database';
import { sessionManager } from '$lib/server/session';
import { updateLeaderboard } from '$lib/server/websocket';
import { randomBytes, scryptSync } from 'crypto';
import type { RequestHandler } from './$types';

const not_allowed_characters = /[1234567890`!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~]/;

export const POST = (async ({ request, cookies }) => {
	const username_raw = request.headers.get('username');
	const password_raw = request.headers.get('password');

	if (!username_raw || !password_raw || !checkData(username_raw, password_raw)) return getResponse(false, 'Ungültige Benutzerdaten.');
	if (!(await checkUsername(username_raw))) return getResponse(false, 'Benutzername ist bereits vergeben.');

	const username = correctUsername(username_raw.trim());

	const password = generateHash(password_raw.trim());
	const user = await createUser(username, password);

	if (!user) return getResponse(false, 'Der Server ist momentan überlastet.');
	const { error } = await sessionManager.createNewSession(cookies, { userID: user.id });
	if (error) return getResponse(false, 'Der Server ist momentan überlastet.');

	if ((getLowestLeader()?.total_points || 0) < user.total_points) updateLeaderboard();

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(username: string, password: string) {
	username = username.trim();
	password = password.trim();
	if (username == '' || password == '') return false;
	else if (username.length < 7 || username.length > 31) return false;
	else if (username.split(' ').length != 2) return false;
	else if (not_allowed_characters.test(username)) return false;
	else return true;
}

async function checkUsername(username: string) {
	const user = await getUserByName(username);
	return user == null;
}

function correctUsername(username: string) {
	let [vor, nach] = username.split(' ');
	vor = vor[0].toUpperCase() + vor.slice(1);
	nach = nach[0].toUpperCase() + nach.slice(1);
	return `${vor} ${nach}`;
}

function generateHash(input: string) {
	const salt = randomBytes(16).toString('hex');
	const hashedPassword = scryptSync(input, salt, 64).toString('hex');
	return `${salt}:${hashedPassword}`;
}
