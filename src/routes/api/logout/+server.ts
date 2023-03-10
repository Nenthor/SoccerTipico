import { getSessionManger } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST = (async ({ cookies }) => {
	const sessionManger = getSessionManger();

	const { error } = await sessionManger.delSession(cookies);
	if (error) await sessionManger.deleteCookie(cookies);

	if (error) return getResponse(false, 'Der Server ist momentan überlastet.');
	else return getResponse(true);
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}
