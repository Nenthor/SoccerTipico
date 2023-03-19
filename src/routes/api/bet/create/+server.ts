import { createBet, getBetByQuestion } from '$lib/server/database';
import { sendToDashboard } from '$lib/server/websocket';
import type { RequestHandler } from './$types';

export const POST = (async ({ request }) => {
	const question = request.headers.get('question');
	const choices_str = request.headers.get('choices');
	const timelimit_str = request.headers.get('timelimit');

	if (!question || !choices_str || !timelimit_str || !checkData(question, choices_str, timelimit_str)) {
		return getResponse(false, `Ungültige Wettdaten.`);
	}

	const choices: string[] = JSON.parse(choices_str);
	if (!choices) return getResponse(false, `Ungültige Auswahlmöglichkeiten.`);
	const timelimit = new Date(timelimit_str);
	if (!timelimit) return getResponse(false, `Ungültiges Zeitfenster.`);
	const existing_bet = await getBetByQuestion(question);
	if (existing_bet) return getResponse(false, `Wette existiert bereits.`);

	const bet = await createBet(question, choices, timelimit);
	if (!bet) return getResponse(false, `Der Server ist momentan überlastet.`);

	sendToDashboard(`bet_new==${JSON.stringify(bet)}`);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}

function checkData(question: string, choices: string, timelimit: string) {
	question = question.trim();
	choices = choices.trim();
	timelimit = choices.trim();
	if (question == '' || choices == '' || timelimit == '') return false;
	else return true;
}
