export interface User {
	id: string;
	username: string;
	bets: PlacedBet[];
	history: HistoryItem[];
	created: string;
	default_points: number;
	total_points: number;
	points: number;
	isAdmin: boolean;
	isBanned: boolean;
}

export interface Leader {
	username: string;
	total_points: number;
}

export interface Bet {
	id: string;
	question: string;
	choices: { [key: string]: number };
	timelimit: string;
}

export interface PlacedBet {
	id: string;
	choice: number;
	value: number;
}

export interface BetResult {
	id: string;
	choice: number;
	pot_value: number;
	bet_value: number;
}

export interface HistoryItem {
	id: string;
	points: number;
}
