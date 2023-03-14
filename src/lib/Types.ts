export interface User {
	userID: string;
	username: string;
	bets: PlacedBet[];
	points: number;
	default_points: number;
	/*isAdmin: boolean;*/
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
