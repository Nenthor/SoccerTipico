import { getMatch } from '$lib/server/database';
import { updatePanelMatch } from '$lib/server/settings';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const match_id = request.headers.get('matchID');
	const panel_id = request.headers.get('panelID');
	const remove = request.headers.get('remove') == 'true';
	if (!match_id || !panel_id || !checkData(match_id, panel_id)) {
		return getResponse(false, `Ungültige Displaydaten.`);
	}

	const match = await getMatch(match_id);
	if (!match) return getResponse(false, `Spiel existiert nicht.`);

	updatePanelMatch(panel_id, remove ? null : match, true);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(match_id: string, panel_id: string) {
	match_id = match_id.trim();
	panel_id = panel_id.trim();
	if (match_id == '' || panel_id == '') return false;
	else return true;
}
