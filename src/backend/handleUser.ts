import { User, createUser, getUserByName } from './database.js';
import { timingSafeEqual, randomBytes, scryptSync } from 'crypto';
import config from './data/config.json' assert { type: 'json' };
import { Request } from 'express';

export async function registerUser(req: Request, username: string, password: string) {
  let user = new User('', username, generateHash(password), config.defaultPoints, '', false);

  user = await createUser(user);

  if (user) {
    req.session.userID = user.id; // Set Session
    return { success: true, username: user.username };
  } else return { success: false, error: 'Benutzername ist bereits vergeben.' };
}

export async function loginUser(req: Request, username: string, password: string) {
  const user = await getUserByName(username);

  if (user && checkPassword(password, user.password)) {
    req.session.userID = user.id; // Set Session
    return { success: true, username: user.username };
  }
  return { success: false, error: 'Benutzdaten stimmen nicht überein.' };
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
