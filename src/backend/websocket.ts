import { Request } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { getAllOpenBets, getUser, User } from './database.js';
import config from './data/config.json' assert { type: 'json' };
import { isBreakStatement } from 'typescript';

let wss: WebSocketServer;

function sendAllClients(message: string) {
  wss.clients.forEach((client) => {
    if (client.readyState == WebSocket.OPEN) client.send(message);
  });
}

export function setupWebsocket(server: http.Server, auth_session) {
  wss = new WebSocketServer({ clientTracking: false, server: server });
  wss.on('connection', (ws: WebSocket, req: Request) => {
    let user: User;
    auth_session(req, {}, async () => {
      if (!req.session.userID) {
        ws.close();
        return;
      }
      user = await getUser(req.session.userID);
    });
    ws.on('message', async (data) => {
      if (!user)
        auth_session(req, {}, async () => {
          if (!req.session.userID) {
            ws.close();
            return;
          }
          user = await getUser(req.session.userID);
          onMessage(String(data).split(':'), ws, user);
        });
      else onMessage(String(data).split(':'), ws, user);
    });
  });
}

async function onMessage(message: string[], ws: WebSocket, user: User) {
  let data = '';
  switch (message[0]) {
    case 'get_default':
      onMessage(['get_stats'], ws, user);
      onMessage(['get_open_bets'], ws, user);
      break;
    case 'get_stats':
      data = JSON.stringify({ username: user.username, points: user.points, default_points: config.defaultPoints, bets: user.bets });
      ws.send(`stats=${data}`);
      break;
    case 'get_open_bets':
      data = JSON.stringify(await getAllOpenBets());
      ws.send(`open_bets=${data}`);
      break;
    default:
      break;
  }
}
