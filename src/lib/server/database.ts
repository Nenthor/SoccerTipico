import type { HistoryItem, PlacedBet } from '$lib/Types';
import PocketBase, { ClientResponseError, Record } from 'pocketbase';
import config from './data/config.json' assert { type: 'json' };

const pb = new PocketBase(`http://${config.PocketBase.ip}:${config.PocketBase.port}`);
await pb.admins.authWithPassword(config.PocketBase.email, config.PocketBase.password);
console.log('Connected to PocketBase');

export class User {
	id: string;
	username: string;
	username_filter: string;
	password: string;
	total_points: number;
	points: number;
	bets: PlacedBet[];
	history: HistoryItem[];
	created: string;
	isBanned: boolean;
	isAdmin: boolean;

	constructor(
		id: string,
		username: string,
		username_filter: string,
		password: string,
		total_points: number,
		points: number,
		bets: PlacedBet[],
		history: HistoryItem[],
		created: string,
		isBanned: boolean,
		isAdmin: boolean
	) {
		this.id = id;
		this.username = username;
		this.username_filter = username_filter;
		this.password = password;
		this.total_points = total_points;
		this.points = points;
		this.bets = bets;
		this.history = history;
		this.created = created;
		this.isBanned = isBanned;
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

export async function getBetByQuestion(question: string) {
	try {
		const record = await pb.collection('bets').getFirstListItem(`question="${question}"`, { $autoCancel: false });
		return extractBet(record);
	} catch (error) {
		return null;
	}
}

export async function getAllBets() {
	try {
		const records = await pb.collection('bets').getFullList(100, { sort: 'timelimit', $autoCancel: false });
		return extractBets(records);
	} catch (error) {
		return null;
	}
}

export async function getAllOpenBets() {
	try {
		const date = new Date().toISOString().replace('T', ' ');
		const records = await pb.collection('bets').getFullList(100, {
			filter: `timelimit >= "${date}"`,
			sort: 'timelimit',
			$autoCancel: false
		});
		return extractBets(records);
	} catch (error) {
		return null;
	}
}

export async function getAllClosedBets() {
	try {
		const date = new Date().toISOString().replace('T', ' ');
		const records = await pb.collection('bets').getFullList(100, {
			filter: `timelimit < "${date}"`,
			sort: 'timelimit',
			$autoCancel: false
		});
		return extractBets(records);
	} catch (error) {
		return null;
	}
}

export async function updateBet(id: string, bet: Bet) {
	try {
		const record = await pb.collection('bets').update(id, bet, { $autoCancel: false });
		return extractBet(record);
	} catch (error) {
		return null;
	}
}

export async function createBet(question: string, choices: string[], timelimit: Date) {
	const choices_obj: any[] = [];
	for (const choice of choices) {
		choices_obj.push({ [choice]: 0 });
	}

	const data = {
		question,
		choices: JSON.stringify(choices_obj),
		timelimit
	};
	try {
		const record = await pb.collection('bets').create(data, { $autoCancel: false });
		return extractBet(record);
	} catch (error) {
		return null;
	}
}

export async function deleteBet(bet: Bet) {
	try {
		await pb.collection('bets').delete(bet.id, { $autoCancel: false });
		return true;
	} catch (error) {
		if (error instanceof ClientResponseError && error.status == 404) {
			return true;
		}
		return false;
	}
}

export async function getUser(id: string) {
	try {
		const record = await pb.collection('users').getOne(id, { $autoCancel: false });
		return extractUser(record);
	} catch (error) {
		return null;
	}
}

export async function getUserByName(username: string) {
	try {
		const record = await pb.collection('users').getFirstListItem(`username_filter="${username.toLowerCase()}"`, {
			$autoCancel: false
		});
		return extractUser(record);
	} catch (error) {
		return null;
	}
}

export async function getAllUsers(sorted: boolean = false) {
	const params = sorted ? { sort: 'username', $autoCancel: false } : { $autoCancel: false };
	try {
		const records = await pb.collection('users').getFullList(200, params);
		return extractUsers(records);
	} catch (error) {
		return null;
	}
}

let ranking: User[];
let leaders: User[];
export async function getLeaders(flush: boolean = false) {
	if (leaders && !flush) return leaders;
	try {
		const records = await pb.collection('users').getFullList(200, {
			filter: 'isAdmin = false && isBanned = false',
			sort: '-total_points,username'
		});
		ranking = extractUsers(records);
		leaders = ranking.slice(0, 10);
		return leaders;
	} catch (error) {
		return null;
	}
}

export function isLeader(user: User) {
	if (!leaders) return false;
	return leaders.find((leader) => user.id == leader.id) != undefined;
}

export function getLowestLeader() {
	if (!leaders || leaders.length < 10) return null;
	return leaders[leaders.length - 1];
}

export function getRanking(id: string) {
	if (!ranking) return -1;
	return ranking.findIndex((u) => u.id == id);
}

export async function updateUser(id: string, user: User) {
	try {
		const record = await pb.collection('users').update(id, user, { $autoCancel: false });
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
		username_filter: username.toLowerCase(),
		password: password,
		total_points: config.defaultPoints,
		points: config.defaultPoints,
		bets: '[]',
		history: JSON.stringify([{ id: 0, points: config.defaultPoints }]),
		isBanned: false,
		isAdmin: false
	};
	try {
		const record = await pb.collection('users').create(data, { $autoCancel: false });
		return extractUser(record);
	} catch (error) {
		return null;
	}
}

export async function deleteUser(user: User) {
	try {
		await pb.collection('users').delete(user.id, { $autoCancel: false });
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
	return new User(
		record.id,
		record.username,
		record.username_filter,
		record.password,
		record.total_points,
		record.points,
		record.bets,
		record.history,
		record.created,
		record.isBanned,
		record.isAdmin
	);
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
