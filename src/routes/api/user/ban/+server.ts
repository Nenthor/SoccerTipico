import { getLowestLeader, getUser, isLeader, updateUser } from '$lib/server/database';
import { updateLeaderboard } from '$lib/server/websocket';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const user_id = request.headers.get('userID');
	const unban = request.headers.get('unban') == 'true'; //optional

	if (!user_id || !checkData(user_id)) {
		return getResponse(false, `Ungültige Userdaten.`);
	}

	let user = await getUser(user_id);
	if (!user) return getResponse(false, `Benutzer existiert nicht.`);
	if (user.isBanned && !unban) return getResponse(false, `Benutzer ist bereits gebannt.`);
	if (!user.isBanned && unban) return getResponse(false, `Benutzer ist nicht gebannt.`);
	if (user.isAdmin) return getResponse(false, `Admins können nicht gebannt werden.`);

	user.isBanned = !unban;
	user = await updateUser(user.id, user);

	if (!user) return getResponse(false, 'Der Server ist momentan überlastet.');

	if (!unban && isLeader(user)) updateLeaderboard();
	else if (unban && (getLowestLeader()?.total_points || 0) <= user.total_points) updateLeaderboard();

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
