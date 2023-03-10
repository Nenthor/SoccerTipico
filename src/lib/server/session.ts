import { RedisSessionStore } from '@ethercorps/sveltekit-redis-session';
import Redis from 'ioredis';

const MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30d
const SESSION_NAME = 'soccer-session';
const SECRET = '7ba70f1925cb776503bf83c171d447fe287e09b967623fc4dd1da6df3240fe5c7d';

const options = {
	cookieName: SESSION_NAME,
	redisClient: new Redis('redis://localhost:6379'),
	secret: SECRET,
	renewSessionBeforeExpiry: true,
	renewBeforeSeconds: MAX_AGE,
	defaultCookiesOption: {
		path: '/',
		maxAge: MAX_AGE,
		sameSite: true,
		secure: false //due to https
	}
};

const sessionManager = new RedisSessionStore(options);

export function getSessionManger() {
	return sessionManager;
}
