import PocketBase, { ClientResponseError, Record } from 'pocketbase';
import config from './data/config.json' assert { type: 'json' };

const pb = new PocketBase(`http://${config.PocketBase.ip}:${config.PocketBase.port}`);
pb.admins.authWithPassword(config.PocketBase.email, config.PocketBase.password);

export class User {
  id: string;
  username: string;
  password: string;
  points: number;
  bet: string;

  constructor(id: string, username: string, password: string, points: number, bet: string) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.points = points;
    this.bet = bet;
  }
}

export async function getUser(username: string) {
  try {
    const record = await pb.collection('users').getFirstListItem(`username="${username}"`);
    return extractUser(record);
  } catch (error) {
    return null;
  }
}

export async function getAllUsers() {
  try {
    const records = await pb.collection('users').getFullList(200);
    return extractUsers(records);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateUser(id: string, user: User) {
  try {
    const record = await pb.collection('users').update(id, user);
    return extractUser(record);
  } catch (error) {
    if (error instanceof ClientResponseError && error.status == 404) {
      return await createUser(user);
    }
    return null;
  }
}

export async function createUser(user: User) {
  const data = {
    username: user.username,
    password: user.password,
    points: user.points,
    bet: user.bet
  };
  try {
    const record = await pb.collection('users').create(data);
    return extractUser(record);
  } catch (error) {
    return null;
  }
}

export async function deleteUser(user: User) {
  try {
    await pb.collection('users').delete(user.id);
    return true;
  } catch (error) {
    if (error instanceof ClientResponseError && error.status == 404) {
      return true;
    }
    return false;
  }
}

function extractUsers(records: Record[]) {
  let users: User[] = [];
  for (let i = 0; i < records.length; i++) {
    users.push(extractUser(records[i]));
  }
  return users;
}

function extractUser(record: Record) {
  return new User(record.id, record.username, record.password, record.points, record.bet);
}
