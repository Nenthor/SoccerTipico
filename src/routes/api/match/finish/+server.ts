import { getAllMatches, getAllTeams, getMatch, updateMatch, updateTeam } from '$lib/server/database';
import { getPanelData, refreshPanel, updatePanelMatch, updatePanelMatchHistory, updatePanelTeams } from '$lib/server/settings';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const match_id = request.headers.get('matchID');

	if (!match_id || !checkData(match_id)) {
		return getResponse(false, `Ungültige Teamdaten.`);
	}

	let match = await getMatch(match_id);
	if (!match) return getResponse(false, `Spiel existiert nicht.`);
	if (match.finished) return getResponse(false, `Spiel ist bereits beendet.`);
	if (!match.team1 || !match.team2) return getResponse(false, `Der Server ist momentan überlastet.`);

	const goal_difference = match.goals1 - match.goals2;
	const team1_result = goal_difference > 0 ? 'win' : goal_difference < 0 ? 'lost' : 'draw';

	switch (team1_result) {
		case 'win':
			match.team1.win += 1;
			match.team2.lose += 1;
			break;
		case 'draw':
			match.team1.draw += 1;
			match.team2.draw += 1;
			break;
		case 'lost':
			match.team1.lose += 1;
			match.team2.win += 1;
			break;
	}

	const check1 = await updateTeam(match.team1.id, match.team1);
	const check2 = await updateTeam(match.team2.id, match.team2);
	if (!check1 || !check2) return getResponse(false, `Der Server ist momentan überlastet.`);

	match.finished = true;
	match = await updateMatch(match.id, match);
	if (!match) return getResponse(false, `Der Server ist momentan überlastet.`);

	if (getPanelData('1')?.match?.id == match.id) updatePanelMatch('1', match);
	if (getPanelData('2')?.match?.id == match.id) updatePanelMatch('2', match);
	const teams = await getAllTeams();
	if (teams) updatePanelTeams(teams);
	const history = await getAllMatches();
	if (history) updatePanelMatchHistory(history);
	refreshPanel('1');
	refreshPanel('2');

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(match_id: string) {
	match_id = match_id.trim();
	if (match_id == '') return false;
	else return true;
}
