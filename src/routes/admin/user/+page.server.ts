import { getUser } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, locals }) => {
	const user_id = url.searchParams.get('id');
	const user = user_id != null ? await getUser(user_id) : null;

	if (!user_id || !user) return { success: false };

	const user_safe = {
		id: user.id,
		username: user.username,
		bets: user.bets,
		total_points: user.total_points,
		points: user.points,
		default_points: locals.default_points,
		isBanned: user.isBanned,
		isAdmin: user.isAdmin
	};

	return { success: true, user: JSON.stringify(user_safe), self: JSON.stringify(locals) };
}) satisfies PageServerLoad;
