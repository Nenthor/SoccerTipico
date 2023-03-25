import { sessionManager } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST = (async ({ cookies }) => {
	const { error } = await sessionManager.delSession(cookies);
	if (error) await sessionManager.deleteCookie(cookies);

	if (error) return getResponse(false, 'Der Server ist momentan überlastet.');
	else return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}
