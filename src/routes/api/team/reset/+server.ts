import { getAllTeams, getTeam, updateTeam } from '$lib/server/database';
import { updatePanelTeams } from '$lib/server/settings';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const team_id = request.headers.get('teamID');

	if (!team_id || !checkData(team_id)) {
		return getResponse(false, `Ungültige Teamdaten.`);
	}

	const team = await getTeam(team_id);
	if (!team) return getResponse(false, `Team existiert nicht.`);

	team.win = 0;
	team.draw = 0;
	team.lose = 0;
	team.goal_difference = 0;

	const success = await updateTeam(team.id, team);
	if (!success) return getResponse(false, `Der Server ist momentan überlastet.`);

	const teams = await getAllTeams();
	if (teams) updatePanelTeams(teams, true);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(team_id: string) {
	team_id = team_id.trim();
	if (team_id == '') return false;
	else return true;
}
