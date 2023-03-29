import { createBet, getBetByQuestion } from '$lib/server/database';
import { updatePanelBet } from '$lib/server/settings';
import { sendToDashboard } from '$lib/server/websocket';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const question = request.headers.get('question');
	const choices_str = request.headers.get('choices');
	const timelimit_str = request.headers.get('timelimit');
	const connected_id = request.headers.get('connectedID'); //optional
	const panel_id = request.headers.get('panelID');

	if (!question || !choices_str || !timelimit_str || !panel_id || !checkData(question, choices_str, timelimit_str, panel_id)) {
		return getResponse(false, `Ungültige Wettdaten.`);
	}

	const choices: string[] = JSON.parse(choices_str);
	if (!choices) return getResponse(false, `Ungültige Auswahlmöglichkeiten.`);
	const timelimit = new Date(timelimit_str);
	if (!timelimit) return getResponse(false, `Ungültiges Zeitfenster.`);
	const existing_bet = await getBetByQuestion(question);
	if (existing_bet) return getResponse(false, `Wette existiert bereits.`);

	const bet = await createBet(question, choices, timelimit, connected_id);
	if (!bet) return getResponse(false, `Der Server ist momentan überlastet.`);

	sendToDashboard(`bet_new==${JSON.stringify(bet)}`);

	if (panel_id == '3') {
		updatePanelBet('1', bet, true);
		updatePanelBet('2', bet, true);
	} else if (panel_id != '-1') updatePanelBet(panel_id, bet, true);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(question: string, choices: string, timelimit: string, panel_id: string) {
	question = question.trim();
	choices = choices.trim();
	timelimit = choices.trim();
	panel_id = panel_id.trim();
	if (question == '' || choices == '' || timelimit == '' || panel_id == '') return false;
	else if (panel_id != '-1' && panel_id != '1' && panel_id != '2' && panel_id != '3') return false;
	else return true;
}
