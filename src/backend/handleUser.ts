import { User, createUser } from './database.js';
import { timingSafeEqual, randomBytes, scryptSync } from 'crypto';
import config from './data/config.json' assert { type: 'json' };

export async function registerUser(username: string, password: string) {
  let user = new User('', username, generateHash(password), config.defaultPoints, '');
  console.log(username);
  user = await createUser(user);
  console.log(user.username);
  if (!user) return { success: false, error: 'Benutzername ist bereits vergeben.' };
  else return { success: true, username: user.username, password: user.password };
}

function generateHash(input: string) {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(input, salt, 64).toString('hex');
  return `${salt}:${hashedPassword}`;
}

function checkPassword(password: string, hash: string) {
  const [salt, key] = hash.split(':');
  const hashBuffer = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return timingSafeEqual(hashBuffer, keyBuffer);
}

function checkHash(hash1: string, hash2: string) {
  return hash1 === hash2;
}
