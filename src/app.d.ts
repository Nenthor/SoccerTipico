// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { PlacedBet } from '$lib/Types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			userID: string;
			username: string;
			bets: PlacedBet[];
			points: number;
			default_points: number;
			/*isAdmin: boolean;*/
		}
		interface PageData {
			success: boolean;
			user?: string;
			bet?: string;
			open_bets?: string;
		}
		// interface Platform {}
	}
}

export {};
