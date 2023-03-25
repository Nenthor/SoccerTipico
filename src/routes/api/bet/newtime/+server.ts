import { getBet, updateBet } from '$lib/server/database';
import { sendToBet, sendToDashboard } from '$lib/server/websocket';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const bet_id = request.headers.get('betID');
	const time_str = request.headers.get('time');

	if (!bet_id || !time_str || !checkData(bet_id, time_str)) {
		return getResponse(false, `Ungültige Wettdaten.`);
	}

	const bet = await getBet(bet_id);
	if (!bet) return getResponse(false, `Wette existiert nicht.`);

	if (new Date(bet.timelimit).getTime() < new Date().getTime()) return getResponse(false, `Wette ist bereits geschlossen`);
	let new_timelimit = new Date();
	new_timelimit.setSeconds(new_timelimit.getSeconds() + parseInt(time_str), 0);
	bet.timelimit = new_timelimit;

	const new_bet = await updateBet(bet_id, bet);
	if (!new_bet) return getResponse(false, `Der Server ist momentan überlastet.`);

	new_timelimit = new Date(new_bet.timelimit);
	const time_obj = { id: bet_id, timelimit: new_timelimit.getTime() };
	sendToBet(bet_id, `bet_timelimit==${new_timelimit.getTime()}`);
	sendToDashboard(`bet_timelimit==${JSON.stringify(time_obj)}`);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(bet_id: string, time_str: string) {
	bet_id = bet_id.trim();
	time_str = time_str.trim();
	if (bet_id == '' || time_str == '' || isNaN(parseInt(time_str))) return false;
	else return true;
}
