import { deleteTeam, getTeam } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const team_id = request.headers.get('teamID');

	if (!team_id || !checkData(team_id)) {
		return getResponse(false, `Ungültige Teamdaten.`);
	}

	const team = await getTeam(team_id);
	if (!team) return getResponse(false, `Team existiert nicht.`);

	const success = await deleteTeam(team);
	if (!success) return getResponse(false, `Der Server ist momentan überlastet.`);

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
