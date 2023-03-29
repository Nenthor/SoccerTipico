import { getAllTeams, getMatch, updateMatch, updateTeam } from '$lib/server/database';
import { getPanelData, updatePanelMatch, updatePanelTeams } from '$lib/server/settings';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const match_id = request.headers.get('matchID');
	const goals1_str = request.headers.get('goals1');
	const goals2_str = request.headers.get('goals2');

	if (!match_id || !goals1_str || !goals2_str || !checkData(match_id, goals1_str, goals2_str)) {
		return getResponse(false, `Ungültige Spieldaten.`);
	}

	let match = await getMatch(match_id);
	if (!match) return getResponse(false, `Spiel existiert nicht.`);
	if (!match.team1 || !match.team2) return getResponse(false, `Der Server ist momentan überlastet.`);

	const goals1 = parseInt(goals1_str);
	const goals2 = parseInt(goals2_str);

	match.team1.goal_difference -= match.goals1 - match.goals2;
	match.team2.goal_difference -= match.goals2 - match.goals1;
	match.goals1 = goals1;
	match.goals2 = goals2;
	match.team1.goal_difference += match.goals1 - match.goals2;
	match.team2.goal_difference += match.goals2 - match.goals1;

	const check1 = await updateTeam(match.team1.id, match.team1);
	const check2 = await updateTeam(match.team2.id, match.team2);
	if (!check1 || !check2) return getResponse(false, `Der Server ist momentan überlastet.`);

	match = await updateMatch(match.id, match);
	if (!match) return getResponse(false, `Der Server ist momentan überlastet.`);

	if(getPanelData('1')?.match?.id == match.id ){
		updatePanelMatch('1', match)
	}
	if(getPanelData('2')?.match?.id == match.id ){
		updatePanelMatch('2', match)
	}
	getAllTeams().then((teams) => {
		if (!teams) return;
		updatePanelTeams(teams);
	});

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(match_id: string, goals1: string, goals2: string) {
	match_id = match_id.trim();
	goals1 = goals1.trim();
	goals2 = goals2.trim();
	if (match_id == '' || goals1 == '' || goals2 == '') return false;
	else if (isNaN(parseInt(goals1)) || isNaN(parseInt(goals2))) return false;
	else return true;
}
