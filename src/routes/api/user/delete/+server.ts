import { deleteUser, getUser, isLeader } from '$lib/server/database';
import { updateLeaderboard } from '$lib/server/websocket';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, locals }) => {
	const user_id = request.headers.get('userID');

	if (!user_id || !checkData(user_id)) {
		return getResponse(false, `Ungültige Userdaten.`);
	}

	let user = await getUser(user_id);
	if (!user) return getResponse(false, `Benutzer existiert nicht.`);
	if (user.isAdmin) return getResponse(false, `Admins können nicht gelöscht werden.`);

	const success = await deleteUser(user);
	if (!success) return getResponse(false, 'Der Server ist momentan überlastet.');
	if (isLeader(user)) updateLeaderboard();

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(user_id: String) {
	user_id = user_id.trim();
	if (user_id == '') return false;
	else return true;
}
