import { RedisSessionStore } from '@ethercorps/sveltekit-redis-session';
import type { CookieSerializeOptions, redisSessionOptions } from '@ethercorps/sveltekit-redis-session/sessionManager';
import Redis from 'ioredis';

const MAX_AGE = 60 * 60 * 24 * 30; // 30d
const SESSION_NAME = 'soccer-session';
const SECRET = '7ba70f1925cb776503bf83c171d447fe287e09b967623fc4dd1da6df3240fe5c7d';

const cookie_options: CookieSerializeOptions = {
	path: '/',
	maxAge: MAX_AGE,
	sameSite: true,
	secure: true,
	priority: 'high'
};

const session_options: redisSessionOptions = {
	cookieName: SESSION_NAME,
	redisClient: new Redis('redis://localhost:6379'),
	secret: SECRET,
	renewSessionBeforeExpire: true,
	cookiesOptions: cookie_options
};

export const sessionManager = new RedisSessionStore(session_options);
