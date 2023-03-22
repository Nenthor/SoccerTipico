import type { RequestHandler } from './$types';
import { setStatus, settings } from '$lib/server/settings';

export const POST = (async ({ request }) => {
	const status_str = request.headers.get('status');

	if (status_str != 'true' && status_str != 'false') {
		return getResponse(false, `Ungültiger Status.`);
	}

	const status = status_str == 'true';

	if (!settings || settings.public == undefined) return getResponse(false, `Der Server ist momentan überlastet.`);
	if (settings.public == status) return getResponse(false, `Der Server hat diesen Status bereits.`);

	setStatus(status);

	return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}
