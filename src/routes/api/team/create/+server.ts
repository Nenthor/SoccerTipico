import { createTeam, getTeamByName } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const name = request.headers.get('name');
	const group = request.headers.get('group');

	if (!name || !group || !checkData(name, group)) {
		return getResponse(false, `Ungültige Teamdaten.`);
	}

	const check = await getTeamByName(name);
	if (check) return getResponse(false, `Teamname ist bereits vergeben.`);

	const team = await createTeam(name, group);
	if (!team) return getResponse(false, `Der Server ist momentan überlastet.`);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(name: string, group: string) {
	name = name.trim();
	group = group.trim();
	if (name == '' || group == '') return false;
	else return true;
}
