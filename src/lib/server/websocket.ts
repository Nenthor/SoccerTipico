import { WebSocketServer as Server } from 'ws';
import https from 'https';
import type { WebSocketServer, WebSocket } from 'ws';
import { readFileSync } from 'fs';
import config from './data/config.json' assert { type: 'json' };

let wss: WebSocketServer;

const ssl = {
	cert: readFileSync(`${config.path}/src/lib/server/data/certificate.cer`),
	key: readFileSync(`${config.path}/src/lib/server/data/private.pem`)
};

const dashboard_sockets: WebSocket[] = [];
const leaderboard_sockets: WebSocket[] = [];
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
		if (i != -1) array.slice(i, 1);
	});
}

export function sendAll(message: string) {
	if (!wss) return;
	wss.clients.forEach((ws) => {
		if (ws.OPEN) ws.send(message);
	});
}

export function sendToDashboard(message: string) {
	if (!wss) return;
	for (const ws of dashboard_sockets) {
		if (ws.OPEN) ws.send(message);
	}
}

export function sendToLeaderboard(message: string) {
	if (!wss) return;
	for (const ws of leaderboard_sockets) {
		if (ws.OPEN) ws.send(message);
	}
}

export function sendToBet(bet_id: string, message: string) {
	if (!wss || !bet_sockets[bet_id]) return;
	for (const ws of bet_sockets[bet_id]) {
		if (ws.OPEN) ws.send(message);
	}
}

export function clearWebsocketBet(bet_id: string) {
	if (!bet_sockets[bet_id]) return;
	for (const ws of bet_sockets[bet_id]) {
		if (ws.OPEN) ws.close();
	}
	bet_sockets[bet_id].slice();
}
