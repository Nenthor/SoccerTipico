import { Bet, getBet, getUser, updateBet, updateUser } from '$lib/server/database';
import type { RequestHandler } from './$types';
import config from '$lib/server/data/config.json' assert { type: 'json' };
import { sendToBet } from '$lib/server/websocket';

let cooldown: { [key: string]: boolean } = {};
let update: { [key: string]: Bet | null } = {};
export const POST = (async ({ request, locals }) => {
	const bet_id = request.headers.get('betId');
	const choice_index_str = request.headers.get('choice');
	const amount_str = request.headers.get('amount');

	if (!bet_id || !choice_index_str || !amount_str || !checkData(bet_id, choice_index_str, amount_str)) {
		return getResponse(false, `Ungültige Wettdaten.`);
	}

	const choice_index = parseInt(choice_index_str);
	const amount = parseInt(amount_str);

	const bet = await getBet(bet_id);
	if (!bet) return getResponse(false, 'Wette ist nicht mehr verfügbar.');
	const choice: any = bet.choices[choice_index];
	if (!choice) return getResponse(false, 'Ungültige Wettoption.');
	if (locals.points < amount) return getResponse(false, 'Wetteinsatz übersteigt Kontostand.');
	if (new Date(bet.timelimit) < new Date()) return getResponse(false, 'Wette ist bereits geschlossen.');

	//bet is valid - placing it
	const user = await getUser(locals.id);
	if (!user) return getResponse(false, 'Der Server ist momentan überlastet.');

	let previous_amount = 0;
	const check_bet = user.bets.filter((b) => b.id == bet.id) || null;
	if (check_bet && check_bet.length != 0) {
		//Already placed bet - only increase
		previous_amount = check_bet[0].value;
		if (check_bet[0].choice != choice_index) return getResponse(false, 'Wettoption kann nicht geändert werden.');
		if (check_bet[0].value >= amount) return getResponse(false, 'Wetteinsatz kann nur erhöht werden.');
		else check_bet[0].value = amount;
	} else {
		user.bets.push({ id: bet_id, choice: choice_index, value: amount });
	}

	user.points -= amount - previous_amount;

	for (const key in choice) {
		choice[key] += amount - previous_amount;
		bet.choices[choice_index] = choice;
	}

	const new_bet = await updateBet(bet.id, bet);
	const success = (await updateUser(locals.id, user)) && new_bet != null;
	if (!success) return getResponse(false, 'Der Server ist momentan überlastet.');

	updateBetRate(new_bet);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(bet_id: string, choice_index: string, amount: string) {
	bet_id = bet_id.trim();
	choice_index = choice_index.trim();
	amount = amount.trim();
	if (bet_id == '' || choice_index == '' || amount == '') return false;
	else if (isNaN(parseInt(choice_index)) || isNaN(parseInt(amount))) return false;
	else if (parseInt(amount) < 0) return false;
	else return true;
}

function updateBetRate(bet: Bet | null) {
	if (bet == null) return;
	if (cooldown[bet.id]) {
		update[bet.id] = bet;
		return;
	}

	sendToBet(bet.id, `bet_rate==${JSON.stringify(bet.choices)}`);

	update[bet.id] = null;
	cooldown[bet.id] = true;
	setTimeout(() => {
		cooldown[bet.id] = false;
		if (update[bet.id]) updateBetRate(update[bet.id]);
	}, config.betRefreshRate);
}
