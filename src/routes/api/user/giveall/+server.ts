import { getAllUsers, updateUser } from '$lib/server/database';
import { settings } from '$lib/server/settings';
import { sendToDashboard, updateLeaderboard } from '$lib/server/websocket';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const points_str = request.headers.get('points');

	if (!points_str || !checkData(points_str)) {
		return getResponse(false, `Ungültige Anzahl an Punkten.`);
	}

	const points = parseInt(points_str);
	const users = await getAllUsers();
	if (!users) return getResponse(false, 'Der Server ist momentan überlastet.');

	let finished = 0;
	users.forEach((user) => {
		if (!settings.public && !user.isAdmin) {
			finished++;
			if (finished == users.length) {
				sendToDashboard(`bonus==${points}`);
				updateLeaderboard();
			}
			return;
		}
		if (user.total_points + points < 0) user.total_points = 0;
		else user.total_points += points;
		if (user.points + points < 0) user.points = 0;
		else user.points += points;
		user.history.push({ id: 'Bonus', points: user.total_points });

		sendToDashboard(`bonus==${points}`);
		updateUser(user.id, user).then(() => {
			finished++;
			if (finished == users.length) updateLeaderboard();
		});
	});

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(points: string) {
	points = points.trim();
	if (points == '' || !parseInt(points)) return false;
	else return true;
}
