import { createMatch, getAllMatches, getMatchByTeamIDs, getTeam } from '$lib/server/database';
import { refreshPanel, updatePanelMatch, updatePanelMatchHistory } from '$lib/server/settings';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const team1_id = request.headers.get('team1ID');
	const team2_id = request.headers.get('team2ID');
	const panel_id = request.headers.get('panelID');

	if (!team1_id || !team2_id || !panel_id || !checkData(team1_id, team2_id, panel_id)) {
		return getResponse(false, `Ungültige Teamdaten.`);
	}

	const check1 = await getTeam(team1_id);
	const check2 = await getTeam(team2_id);
	if (!check1 || !check2) return getResponse(false, `Team existiert nicht`);

	const check3 = await getMatchByTeamIDs(team1_id, team2_id);
	if (check3 && !check3.finished) return getResponse(false, `Spiel ist bereits erstellt.`);

	const check4 = await getMatchByTeamIDs(team2_id, team1_id);
	if (check4 && !check4.finished) return getResponse(false, `Spiel ist bereits erstellt.`);

	const match = await createMatch(team1_id, team2_id, null);
	if (!match) return getResponse(false, `Der Server ist momentan überlastet.`);

	if (panel_id == '3' || panel_id == '1') updatePanelMatch('1', match);
	if (panel_id == '3' || panel_id == '2') updatePanelMatch('2', match);
	const history = await getAllMatches();
	if (history) updatePanelMatchHistory(history);
	refreshPanel('1');
	refreshPanel('2');

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(team1_id: string, team2_id: string, panel_id: string) {
	team1_id = team1_id.trim();
	team2_id = team2_id.trim();
	panel_id = panel_id.trim();
	if (team1_id == '' || team2_id == '' || panel_id == '') return false;
	else if (panel_id != '-1' && panel_id != '1' && panel_id != '2' && panel_id != '3') return false;
	else return true;
}
