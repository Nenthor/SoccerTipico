import { createMatch, getMatchByTeamIDs, getTeam } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const team1_id = request.headers.get('team1ID');
	const team2_id = request.headers.get('team2ID');

	if (!team1_id || !team2_id || !checkData(team1_id, team2_id)) {
		return getResponse(false, `Ungültige Teamdaten.`);
	}

	const check1 = await getTeam(team1_id);
	const check2 = await getTeam(team2_id);
	if (!check1 || !check2) return getResponse(false, `Team existiert nicht`);

	const check3 = await getMatchByTeamIDs(team1_id, team2_id);
	if (check3) return getResponse(false, `Spiel ist bereits erstellt.`);

	const match = await createMatch(team1_id, team2_id);
	if (!match) return getResponse(false, `Der Server ist momentan überlastet.`);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(team1_id: string, team2_id: string) {
	team1_id = team1_id.trim();
	team2_id = team2_id.trim();
	if (team1_id == '' || team2_id == '') return false;
	else return true;
}
