// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			userID: string;
			username: string;
			bets: string;
			points: number;
		}
		interface PageData {
			success: boolean;
			user?: string;
			bet?: string;
		}
		// interface Platform {}
	}
}

export {};
