import path from 'path';
import fs from 'fs';
import os from 'os';
import http from 'http';
import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { loginUser, registerUser } from './handleUser.js';
import config from './data/config.json' assert { type: 'json' };

const app = express();
const port = os.type() === 'Linux' ? 8888 : 8888;
const dirname = path.resolve();
const SESSION_AGE = 1000 * 60 * 60 * 24 * 30; // 30d
const SESSION_NAME = 'auth';

declare module 'express-session' {
  export interface SessionData {
    userID: string;
  }
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: SESSION_AGE,
      sameSite: true,
      secure: false //due to http
    },
    secret: config.sessionSecret
  })
);

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

app.get('*', (req, res) => {
  res.status(404);
  res.end();
});

const server = http.createServer(app);
server.listen(port, () => console.log(`Server is listening to port ${port}`));
