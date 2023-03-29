import type { RequestHandler } from './$types';
import { refreshPanel, setGrouphase, settings } from '$lib/server/settings';

export const POST = (async ({ request }) => {
	const status_str = request.headers.get('status');

	if (status_str != 'true' && status_str != 'false') {
		return getResponse(false, `Ungültige Phase.`);
	}

	const status = status_str == 'true';

	if (!settings || settings.groupphase == undefined) return getResponse(false, `Der Server ist momentan überlastet.`);
	if (settings.groupphase == status) return getResponse(false, `Der Server hat diese Phase bereits.`);

	setGrouphase(status);
	refreshPanel('1');
	refreshPanel('2');

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}
