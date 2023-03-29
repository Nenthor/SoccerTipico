import type { HistoryItem, PlacedBet } from '$lib/Types';
import PocketBase, { ClientResponseError, Record } from 'pocketbase';
import config from './data/config.json' assert { type: 'json' };
import { setupSettings } from './settings';

const pb = new PocketBase(`http://${config.PocketBase.ip}:${config.PocketBase.port}`);
await pb.admins.authWithPassword(config.PocketBase.email, config.PocketBase.password);
console.log('Connected to PocketBase');

getAllMatches().then((matches) => {
	getAllTeams().then((teams) => {
		if (!teams) teams = [];
		if (!matches) matches = [];
		setupSettings(JSON.stringify(matches), JSON.stringify(teams));
	});
});

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
	match_id: string | null;

	constructor(id: string, question: string, choices: { [key: string]: number }, timelimit: Date, match_id: string | null) {
		this.id = id;
		this.question = question;
		this.choices = choices;
		this.timelimit = timelimit;
		this.match_id = match_id;
	}
}

export class Team {
	id: string;
	name: string;
	goal_difference: number;
	win: number;
	draw: number;
	lose: number;
	group: string;

	constructor(id: string, name: string, goal_difference: number, win: number, draw: number, lose: number, group: string) {
		this.id = id;
		this.name = name;
		this.goal_difference = goal_difference;
		this.win = win;
		this.draw = draw;
		this.lose = lose;
		this.group = group;
	}
}

export class Match {
	id: string;
	team1: Team | null;
	team2: Team | null;
	goals1: number;
	goals2: number;
	finished: boolean;
	bet: Bet | null;

	constructor(id: string, team1: Team | null, team2: Team | null, goals1: number, goals2: number, finished: boolean, bet: Bet | null) {
		this.id = id;
		this.team1 = team1;
		this.team2 = team2;
		this.goals1 = goals1;
		this.goals2 = goals2;
		this.finished = finished;
		this.bet = bet;
	}
}

export async function getMatch(id: string) {
	try {
		const record = await pb.collection('matches').getOne(id, { expand: 'team1,team2,bet', $autoCancel: false });
		return extractMatch(record);
	} catch (error) {
		return null;
	}
}

export async function getMatchByTeamIDs(id1: string, id2: string) {
	try {
		const record = await pb.collection('matches').getFirstListItem(`team1.id="${id1}" && team2.id="${id2}" `, { expand: 'team1,team2,bet', $autoCancel: false });
		return extractMatch(record);
	} catch (error) {
		return null;
	}
}

export async function getAllMatches() {
	try {
		const records = await pb.collection('matches').getFullList(100, { expand: 'team1,team2,bet', sort: 'finished,team1.name,team2.name', $autoCancel: false });
		return extractMatches(records);
	} catch (error) {
		return null;
	}
}

export async function getAllOpenMatches() {
	try {
		const records = await pb.collection('matches').getFullList(100, { expand: 'team1,team2,bet', filter: 'finished = false', sort: 'team1.name,team2.name', $autoCancel: false });
		return extractMatches(records);
	} catch (error) {
		return null;
	}
}

export async function getAllClosedMatches() {
	try {
		const records = await pb.collection('matches').getFullList(100, { expand: 'team1,team2,bet', filter: 'finished = true', sort: 'team1.name,team2.name', $autoCancel: false });
		return extractMatches(records);
	} catch (error) {
		return null;
	}
}

export async function updateMatch(id: string, match: Match) {
	if (!match.team1 || !match.team2) return null;
	const data = {
		team1: match.team1.id,
		team2: match.team2.id,
		goals1: match.goals1,
		goals2: match.goals2,
		finished: match.finished,
		bet: match.bet?.id
	};
	try {
		const record = await pb.collection('matches').update(id, data, { expand: 'team1,team2,bet', $autoCancel: false });
		return extractMatch(record);
	} catch (error) {
		return null;
	}
}

export async function createMatch(id1: string, id2: string, bet: Bet | null) {
	const data = {
		team1: id1,
		team2: id2,
		goals1: 0,
		goals2: 0,
		finished: false,
		bet: bet
	};
	try {
		const record = await pb.collection('matches').create(data, { expand: 'team1,team2,bet', $autoCancel: false });
		return extractMatch(record);
	} catch (error) {
		return null;
	}
}

export async function deleteMatch(match: Match) {
	try {
		await pb.collection('matches').delete(match.id, { expand: 'team1,team2,bet', $autoCancel: false });
		return true;
	} catch (error) {
		if (error instanceof ClientResponseError && error.status == 404) {
			return true;
		}
		return false;
	}
}

export async function getTeam(id: string) {
	try {
		const record = await pb.collection('teams').getOne(id, { $autoCancel: false });
		return extractTeam(record);
	} catch (error) {
		return null;
	}
}

export async function getTeamByName(name: string) {
	try {
		const record = await pb.collection('teams').getFirstListItem(`name="${name}"`, { $autoCancel: false });
		return extractTeam(record);
	} catch (error) {
		return null;
	}
}

export async function getAllTeams() {
	try {
		const records = await pb.collection('teams').getFullList(100, { sort: 'name', $autoCancel: false });
		return extractTeams(records);
	} catch (error) {
		return null;
	}
}

export async function getAllTeamsInGroup(group: string) {
	try {
		const records = await pb.collection('teams').getFullList(100, { sort: 'name', filter: `group == "${group}"`, $autoCancel: false });
		return extractTeams(records);
	} catch (error) {
		return null;
	}
}

export async function updateTeam(id: string, team: Team) {
	try {
		const record = await pb.collection('teams').update(id, team, { $autoCancel: false });
		return extractTeam(record);
	} catch (error) {
		return null;
	}
}

export async function createTeam(name: string, group: string) {
	const data = {
		name,
		goal_difference: 0,
		win: 0,
		draw: 0,
		lose: 0,
		group
	};
	try {
		const record = await pb.collection('teams').create(data, { $autoCancel: false });
		return extractTeam(record);
	} catch (error) {
		return null;
	}
}

export async function deleteTeam(team: Team) {
	try {
		await pb.collection('teams').delete(team.id, { $autoCancel: false });
		return true;
	} catch (error) {
		if (error instanceof ClientResponseError && error.status == 404) {
			return true;
		}
		return false;
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
	const data = {
		question: bet.question,
		choices: JSON.stringify(bet.choices),
		timelimit: bet.timelimit,
		match_id: bet.match_id || null
	};
	try {
		const record = await pb.collection('bets').update(id, data, { $autoCancel: false });
		return extractBet(record);
	} catch (error) {
		return null;
	}
}

export async function createBet(question: string, choices: string[], timelimit: Date, match_id: string | null = null) {
	const choices_obj: any[] = [];
	for (const choice of choices) {
		choices_obj.push({ [choice]: 0 });
	}

	const data = {
		question,
		choices: JSON.stringify(choices_obj),
		timelimit,
		match_id
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
	let bets: Bet[] = [];
	for (let i = 0; i < records.length; i++) {
		bets.push(extractBet(records[i]));
	}
	return bets;
}

function extractBet(record: Record) {
	return new Bet(record.id, record.question, record.choices, record.timelimit, record.match_id);
}

function extractTeams(records: Record[]) {
	let teams: Team[] = [];
	for (let i = 0; i < records.length; i++) {
		teams.push(extractTeam(records[i]));
	}
	return teams;
}

function extractTeam(record: Record) {
	return new Team(record.id, record.name, record.goal_difference, record.win, record.draw, record.lose, record.group);
}

function extractMatches(records: Record[]) {
	let matches: Match[] = [];
	for (let i = 0; i < records.length; i++) {
		matches.push(extractMatch(records[i]));
	}
	return matches;
}

function extractMatch(record: Record) {
	let team1: Team | null = null;
	let team2: Team | null = null;
	let bet: Bet | null = null;
	if (record.expand.team1 && !(record.expand.team1 instanceof Array)) {
		team1 = extractTeam(record.expand.team1);
	}
	if (record.expand.team2 && !(record.expand.team2 instanceof Array)) {
		team2 = extractTeam(record.expand.team2);
	}
	if (record.expand.bet && !(record.expand.bet instanceof Array)) {
		bet = extractBet(record.expand.bet);
	}
	return new Match(record.id, team1, team2, record.goals1, record.goals2, record.finished, bet);
}
