import { getBet } from '$lib/server/database';
import { updatePanelBet } from '$lib/server/settings';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const bet_id = request.headers.get('betID');
	const panel_id = request.headers.get('panelID');
	const remove = request.headers.get('remove') == 'true';

	if (!bet_id || !panel_id || !checkData(bet_id, panel_id)) {
		return getResponse(false, `Ungültige Displaydaten.`);
	}

	const bet = await getBet(bet_id);
	if (!bet) return getResponse(false, `Wette existiert nicht.`);

	updatePanelBet(panel_id, remove ? null : bet);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(bet_id: string, panel_id: string) {
	bet_id = bet_id.trim();
	panel_id = panel_id.trim();
	if (bet_id == '' || panel_id == '') return false;
	else return true;
}
