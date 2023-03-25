import { deleteBet, getAllBets, getAllUsers, updateUser } from '$lib/server/database';
import type { RequestHandler } from './$types';
import config from '$lib/server/data/config.json' assert { type: 'json' };
import { updateLeaderboard } from '$lib/server/websocket';

const valid_users = ['bogw0pimrzxwcme', '1prnmb580eyi0wu']; // ['Amadeus_id', 'David_id']
export const POST = (async ({ locals }) => {
	if (!valid_users.includes(locals.id)) return getResponse(false, 'Nur die Entwickler sind dazu berechtigt.');

	const users = await getAllUsers();
	const bets = await getAllBets();

	if (!users || !bets) return getResponse(false, 'Der Server ist momentan überlastet.');

	bets.forEach((bet) => deleteBet(bet));

	let user_finished = 0;
	users.forEach((user) => {
		user.bets = [];
		user.history = [{ id: '0', points: config.defaultPoints }];
		user.total_points = config.defaultPoints;
		user.points = config.defaultPoints;
		updateUser(user.id, user).then(() => {
			user_finished++;
			if (user_finished == users.length) updateLeaderboard();
		});
	});

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}
