import { createUser, getUserByName } from '$lib/server/database';
import { getSessionManger } from '$lib/server/session';
import { randomBytes, scryptSync } from 'crypto';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, cookies }) => {
	const username = request.headers.get('username');
	let password = request.headers.get('password');

	if (!username || !password || !checkData(username, password)) return getResponse(false, 'Ungültige Benutzerdaten.');
	if (!(await checkUsername(username))) return getResponse(false, 'Benutzername ist bereits vergeben.');

	password = generateHash(password);
	const user = await createUser(username, password);

	if (!user) return getResponse(false, 'Der Server ist momentan überlastet.');
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
	else if (username.length < 3 || username.length > 25) return false;
	else return true;
}

async function checkUsername(username: string) {
	const user = await getUserByName(username);
	return user == null;
}

function generateHash(input: string) {
	const salt = randomBytes(16).toString('hex');
	const hashedPassword = scryptSync(input, salt, 64).toString('hex');
	return `${salt}:${hashedPassword}`;
}
