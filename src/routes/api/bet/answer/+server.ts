import { deleteBet, getAllUsers, getBet, updateUser } from '$lib/server/database';
import { sendToDashboard, updateLeaderboard } from '$lib/server/websocket';
import type { BetResult } from '$lib/Types';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const bet_id = request.headers.get('betID');
	const correct_choice_str = request.headers.get('correctChoice'); //index

	if (!bet_id || !correct_choice_str || !checkData(bet_id, correct_choice_str)) {
		return getResponse(false, `Ungültige Wettdaten.`);
	}

	const correct_choice = parseInt(correct_choice_str);
	const bet = await getBet(bet_id);
	if (!bet) return getResponse(false, `Wette existiert nicht.`);
	if (!bet.choices[correct_choice]) return getResponse(false, `Wettoption existiert nicht.`);

	const users = await getAllUsers();
	if (!users) return getResponse(false, `Der Server ist momentan überlastet.`);

	let pot_value = 0;
	let bet_value = 0;
	for (let index in bet.choices) {
		Object.entries(bet.choices[index]).forEach(([key, value_str]) => {
			const value = parseInt(`${value_str}`);
			pot_value += value;
			if (index == correct_choice_str) bet_value = value;
		});
	}

	let finished = 0;
	for (const user of users) {
		const index = user.bets.findIndex((b) => b.id == bet.id);
		if (index != -1) {
			const placed_bet = user.bets.splice(index, 1)[0];

			user.total_points -= placed_bet.value;
			if (placed_bet.choice == correct_choice) {
				//User has won bet
				const winnings = Math.ceil((placed_bet.value / bet_value) * pot_value);
				user.total_points += winnings;
				user.points += winnings;
			}
		}
		user.history.push({ id: bet.id, points: user.total_points });

		updateUser(user.id, user).then(() => {
			finished++;
			if (finished == users.length) updateLeaderboard();
		});
	}

	const bet_result: BetResult = { id: bet.id, choice: correct_choice, bet_value, pot_value };
	sendToDashboard(`bet_result==${JSON.stringify(bet_result)}`);

	if (!(await deleteBet(bet))) return getResponse(false, `Der Server ist momentan überlastet.`);
	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(bet_id: string, correct_choice: string) {
	bet_id = bet_id.trim();
	correct_choice = correct_choice.trim();
	if (bet_id == '' || correct_choice == '' || isNaN(parseInt(correct_choice))) return false;
	else return true;
}
