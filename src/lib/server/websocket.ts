import { WebSocketServer as Server } from 'ws';
import https from 'https';
import type { WebSocketServer, WebSocket } from 'ws';
import { readFileSync } from 'fs';
import config from './data/config.json' assert { type: 'json' };
import { getLeaders } from './database';
import type { Leader } from '$lib/Types';
import { getPanelData } from './settings';

let wss: WebSocketServer;

const ssl = {
	cert: readFileSync(`${config.path}/src/lib/server/data/certificate.cer`),
	key: readFileSync(`${config.path}/src/lib/server/data/private.pem`)
};

const dashboard_sockets: WebSocket[] = [];
const leaderboard_sockets: WebSocket[] = [];
const panel_sockets: { [panel_id: string]: WebSocket } = {};
const bet_sockets: { [bet_id: string]: WebSocket[] } = {};

export function setupWebsocketServer(port: number) {
	if (wss) return;

	wss = new Server({ server: https.createServer(ssl).listen(port) });

	wss.addListener('listening', () => console.log('Connected to WebSocket'));
	wss.addListener('connection', (ws, req) => {
		const url = new URL(req?.url || '', `http://${req.headers.host}`);

		switch (url.pathname) {
			case '/dashboard':
				storeSocket(ws, dashboard_sockets);
				break;
			case '/leaderboard':
				storeSocket(ws, leaderboard_sockets);
				break;
			case '/bet':
				const bet_id = url.searchParams.get('id');
				if (bet_id) {
					if (!bet_sockets[bet_id]) bet_sockets[bet_id] = [];
					storeSocket(ws, bet_sockets[bet_id]);
				} else ws.close();
				break;
			case '/panel':
				const panel_id_str = url.searchParams.get('id');
				if (panel_id_str && !isNaN(parseInt(panel_id_str))) {
					const panel_id = parseInt(panel_id_str);
					panel_sockets[panel_id] = ws;
				} else ws.close();
				break;
			default:
				ws.close();
				break;
		}
	});
}

function storeSocket(ws: WebSocket, array: WebSocket[]) {
	array.push(ws);
	ws.addListener('close', () => {
		const i = array.indexOf(ws);
		if (i != -1) array.splice(i, 1);
	});
}

export function sendAll(message: string) {
	if (!wss) return;
	wss.clients.forEach((ws) => {
		if (ws.OPEN) ws.send(message);
	});
}

/**
 * Send messages to all Dashboard clients
 * @param message - `bet_new==[type Bet]`
 * @param message - `bet_result==[type BetResult]`
 * @param message - `bet_timelimit=={id: bet_id, timelimit: new_timelimit}`
 * @param message - `bonus==[type number]`
 */
export function sendToDashboard(message: string) {
	if (!wss) return;
	for (const ws of dashboard_sockets) {
		if (ws.OPEN) ws.send(message);
	}
}

/**
 * Send messages to all leaderboard clients
 * @param message - `leaderboard==[type Leaders[]]`
 */
export function sendToLeaderboard(message: string) {
	if (!wss) return;
	for (const ws of leaderboard_sockets) {
		if (ws.OPEN) ws.send(message);
	}
	sendToPanel('1', message);
	sendToPanel('2', message);
}

/**
 * Send messages to all bet clients with same bet_id
 * @param bet_id - Unique betId
 * @param message - `bet_rate==[type bet.choices[]]`
 * @param message - `bet_timelimit==[number]`
 */
export function sendToBet(bet_id: string, message: string) {
	if (!wss || !bet_sockets[bet_id]) return;
	for (const ws of bet_sockets[bet_id]) {
		if (ws.OPEN) ws.send(message);
	}
}

/**
 * Send messages to all bet clients with same bet_id
 * @param bet_id - Unique betId
 * @param message - `update==[type PanelData]`
 */
export function sendToPanel(panel_id: string, message: string) {
	if (!wss || !panel_sockets[panel_id]) return;
	if (panel_sockets[panel_id].OPEN) panel_sockets[panel_id].send(message);
}

export function clearWebsocketBet(bet_id: string) {
	if (!bet_sockets[bet_id]) return;
	for (const ws of bet_sockets[bet_id]) {
		if (ws.OPEN) ws.close();
	}
	bet_sockets[bet_id].splice(0, bet_sockets[bet_id].length);
}

export async function updateLeaderboard() {
	const leaders = await getLeaders(true);
	if (!leaders) return;
	let leaders_safe: Leader[] = [];
	for (const leader of leaders) leaders_safe.push({ username: leader.username, total_points: leader.total_points });
	sendToLeaderboard(`leaderboard==${JSON.stringify(leaders_safe)}`);
}
