import path from 'path';
import fs from 'fs';
import os from 'os';
import http from 'http';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { loginUser, registerUser } from './handleUser.js';
import config from './data/config.json' assert { type: 'json' };
import { getUser, User } from './database.js';
import { setupWebsocket } from './websocket.js';

const app = express();
const port = os.type() === 'Linux' ? 8888 : 8888;
const dirname = path.resolve();
const SESSION_AGE = 1000 * 60 * 60 * 24 * 30; // 30d
const SESSION_NAME = 'auth';

const redisClient = createClient();
redisClient.connect().catch(console.error);
const redisStore = new RedisStore({ client: redisClient });

declare module 'express-session' {
  export interface SessionData {
    userID: string;
  }
}

const auth_session = session({
  name: SESSION_NAME,
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  secret: config.sessionSecret,
  cookie: {
    maxAge: SESSION_AGE,
    sameSite: true,
    secure: false //due to http
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(auth_session);

app.use('/js', express.static(path.join(dirname, 'src/frontend/js')));
app.use('/css', express.static(path.join(dirname, 'src/frontend/css')));
app.use('/images', express.static(path.join(dirname, 'src/frontend/images')));
app.use('/fonts', express.static(path.join(dirname, 'src/frontend/fonts')));

const nonAuthPages = ['/register', '/login', '/api/register', '/api/login'];
const authCheck = (req: Request, res: Response, next: NextFunction) => {
  if (nonAuthPages.includes(req.route.path)) {
    //Auth is not required - check if user is already logged in
    if (req.session.userID) res.redirect('/dashboard');
    else next();
  } else {
    //Auth is required - check if user is logged in
    if (!req.session.userID) {
      res.redirect('/register');
    } else next();
  }
};

app.get('/', (req, res) => {
  if (req.session.userID) res.redirect('/dashboard');
  else res.redirect('register');
});

const pages = fs.readdirSync(path.join(dirname, 'src/frontend/html'), { encoding: 'utf8' });
for (let page of pages) {
  if (!page.endsWith('.html')) continue;
  page = page.slice(0, page.length - 5);

  app.get(`/${page}`, authCheck, (req, res) => {
    fs.readFile(path.join(dirname, `src/frontend/html/${page}.html`), (error, data) => {
      if (error) res.status(500);
      else res.write(data);
      res.end();
    });
  });
}

app.post('/api/register', authCheck, async (req, res) => {
  const response = await registerUser(req, req.body.username, req.body.password);

  res.send(response);
});

app.post('/api/login', authCheck, async (req, res) => {
  const response = await loginUser(req, req.body.username, req.body.password);

  res.send(response);
});

app.post('/api/logout', authCheck, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send({ success: false, error: 'Ein interner Fehler ist aufgetreten.' });
      return;
    }
    res.clearCookie(SESSION_NAME);
    res.send({ success: true });
  });
});

app.post('/api/stats', authCheck, async (req, res) => {
  const user: User = res.locals.user;
  if (user) res.send({ success: true, username: user.username, points: user.points, bet: user.bets });
  else res.send({ success: false, error: 'Benutzerdaten konnten nicht abgerufen werden.' });
});

app.get('*', (req, res) => {
  res.status(404);
  res.end();
});

const server = http.createServer(app);
setupWebsocket(server, auth_session);
server.listen(port, () => console.log(`Server is listening to port ${port}`));
