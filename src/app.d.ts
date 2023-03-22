// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { HistoryItem, PlacedBet } from '$lib/Types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			id: string;
			username: string;
			bets: PlacedBet[];
			history: HistoryItem[];
			total_points: number;
			points: number;
			default_points: number;
			isBanned: boolean;
			isAdmin: boolean;
		}
		interface PageData {
			success: boolean;
			user?: string;
			bet?: string;
			open_bets?: string;
			closed_bets?: string;
		}
		// interface Platform {}
	}
}

export {};
