import { getRanking } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const POST = (async ({ locals }) => {
	return getResponse(true, getRanking(locals.id).toString());
}) satisfies RequestHandler;

function getResponse(success: boolean, message?: string) {
	return new Response(JSON.stringify({ success, message }), { status: 200 });
}
