import { getBet, getUser, updateBet, updateUser } from '$lib/server/database';
import type { PlacedBet } from '$lib/Types';
import { timingSafeEqual, scryptSync } from 'crypto';
import type { RequestHandler } from './$types';

export const POST = (async ({ request, locals }) => {
	const bet_id = request.headers.get('bet_id');
	const choice_index_str = request.headers.get('choice');
	const amount_str = request.headers.get('amount');

	if (!bet_id || !choice_index_str || !amount_str || !checkData(bet_id, choice_index_str, amount_str)) {
		return getResponse(false, 'Ungültige Wettdaten.');
	}

	const choice_index = parseInt(choice_index_str);
	const amount = parseInt(amount_str);

	const bet = await getBet(bet_id);
	if (!bet) return getResponse(false, 'Ungültige Wett-ID.');
	const choice: any = bet.choices[choice_index];
	if (!choice) return getResponse(false, 'Ungültige Wettoption.');
	if (locals.points < amount) return getResponse(false, 'Wetteinsatz übersteigt Kontostand.');
	if (new Date(bet.timelimit) < new Date()) return getResponse(false, 'Wette ist bereits geschlossen.');

	//bet is valid - placing it
	const user = await getUser(locals.userID);
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

	user.points -= amount;

	for (const key in choice) {
		choice[key] += amount - previous_amount;
		bet.choices[choice_index] = choice;
	}

	const success = (await updateUser(locals.userID, user)) && (await updateBet(bet.id, bet)) != null;

	if (!success) return getResponse(false, 'Der Server ist momentan überlastet.');

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
