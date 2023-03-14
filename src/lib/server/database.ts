import type { PlacedBet } from '$lib/Types';
import PocketBase, { ClientResponseError, Record } from 'pocketbase';
import config from './data/config.json' assert { type: 'json' };

const pb = new PocketBase(`http://${config.PocketBase.ip}:${config.PocketBase.port}`);
await pb.admins.authWithPassword(config.PocketBase.email, config.PocketBase.password);
console.log('Connected to PocketBase.');

export class User {
	id: string;
	username: string;
	password: string;
	points: number;
	bets: PlacedBet[];
	isAdmin: boolean;

	constructor(id: string, username: string, password: string, points: number, bets: PlacedBet[], isAdmin: boolean) {
		this.id = id;
		this.username = username;
		this.password = password;
		this.points = points;
		this.bets = bets;
		this.isAdmin = isAdmin;
	}
}

export class Bet {
	id: string;
	question: string;
	choices: { [key: string]: number };
	timelimit: Date;

	constructor(id: string, question: string, choices: { [key: string]: number }, timelimit: Date) {
		this.id = id;
		this.question = question;
		this.choices = choices;
		this.timelimit = timelimit;
	}
}

export async function getBet(id: string) {
	try {
		const record = await pb.collection('bets').getOne(id, { $autoCancel: false });
		return extractBet(record);
	} catch (error) {
		return null;
	}
}

export async function getAllBets() {
	try {
		const records = await pb.collection('bets').getFullList(200, { $autoCancel: false });
		return extractBets(records);
	} catch (error) {
		return null;
	}
}

export async function getAllOpenBets() {
	try {
		const date = new Date().toISOString().replace('T', ' ');
		const records = await pb.collection('bets').getList(1, 50, {
			filter: `timelimit >= "${date}"`
		});
		return extractBets(records.items);
	} catch (error) {
		return null;
	}
}

export async function updateBet(id: string, bet: Bet) {
	try {
		const record = await pb.collection('bets').update(id, bet);
		return extractBet(record);
	} catch (error) {
		return null;
	}
}

export async function getUser(id: string) {
	try {
		const record = await pb.collection('users').getOne(id, { $autoCancel: false });
		return extractUser(record);
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function getUserByName(username: string) {
	try {
		const record = await pb.collection('users').getFirstListItem(`username="${username}"`, {
			$autoCancel: false
		});
		return extractUser(record);
	} catch (error) {
		return null;
	}
}

export async function getAllUsers() {
	try {
		const records = await pb.collection('users').getFullList(200, { $autoCancel: false });
		return extractUsers(records);
	} catch (error) {
		return null;
	}
}

export async function getLeaders() {
	try {
		const records = await pb.collection('users').getList(1, 10, {
			filter: 'isAdmin = false',
			sort: '-points'
		});
		return extractUsers(records.items);
	} catch (error) {
		return null;
	}
}

export async function updateUser(id: string, user: User) {
	try {
		const record = await pb.collection('users').update(id, user);
		return extractUser(record);
	} catch (error) {
		if (error instanceof ClientResponseError && error.status == 404) {
			return await createUser(user.username, user.password);
		}
		return null;
	}
}

export async function createUser(username: string, password: string) {
	const data = {
		username: username,
		password: password,
		points: config.defaultPoints,
		bets: '[]',
		isAdmin: false
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
	return new User(record.id, record.username, record.password, record.points, record.bets, record.isAdmin);
}

function extractBets(records: Record[]) {
	let users: Bet[] = [];
	for (let i = 0; i < records.length; i++) {
		users.push(extractBet(records[i]));
	}
	return users;
}

function extractBet(record: Record) {
	return new Bet(record.id, record.question, record.choices, record.timelimit);
}
