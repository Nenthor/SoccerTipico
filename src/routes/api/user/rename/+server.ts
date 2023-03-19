import { getUser, isLeader, updateUser } from '$lib/server/database';
import { updateLeaderboard } from '$lib/server/websocket';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const user_id = request.headers.get('userID');
	const username = request.headers.get('username'); // username= Vorname + ' ' + Nachname

	if (!user_id || !username || !checkData(user_id, username)) {
		return getResponse(false, `Ungültige Benutzerdaten.`);
	}

	let user = await getUser(user_id);
	if (!user) return getResponse(false, 'Benutzer existiert nicht.');
	if (user.isAdmin) return getResponse(false, `Admins können nicht umbenannt werden.`);
	if (user.username == username) return getResponse(false, `Benutzername ist bereits gesetzt.`);

	user.username = username;
	user = await updateUser(user.id, user);

	if (!user) return getResponse(false, 'Der Server ist momentan überlastet.');
	if (isLeader(user)) updateLeaderboard();

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(user_id: string, username: string) {
	user_id = user_id.trim();
	username = username.trim();
	if (user_id == '' || username == '') return false;
	else if (username.split(' ').length != 2) return false;
	else return true;
}
