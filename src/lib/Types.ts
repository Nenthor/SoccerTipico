export interface User {
	userID: string;
	username: string;
	bets: PlacedBet[];
	points: number;
	default_points: number;
	isAdmin: boolean;
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
