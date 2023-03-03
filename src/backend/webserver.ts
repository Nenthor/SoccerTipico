import path from 'path';
import fs from 'fs';
import os from 'os';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { registerUser } from './handleUser.js';

const app = express();
const port = os.type() === 'Linux' ? 8888 : 8888;
const dirname = path.resolve();

app.use(bodyParser.json());

app.use('/js', express.static(path.join(dirname, 'src/frontend/js')));
app.use('/css', express.static(path.join(dirname, 'src/frontend/css')));
app.use('/images', express.static(path.join(dirname, 'src/frontend/images')));
app.use('/fonts', express.static(path.join(dirname, 'src/frontend/fonts')));

app.get('/', (req, res) => {
  fs.readFile(path.join(dirname, `src/frontend/html/index.html`), (error, data) => {
    if (error) res.status(500);
    else res.write(data);
    res.end();
  });
});

const pages = fs.readdirSync(path.join(dirname, 'src/frontend/html'), { encoding: 'utf8' });
for (let page of pages) {
  if (!page.endsWith('.html')) continue;
  page = page.slice(0, page.length - 5);

  app.get(`/${page}`, (req, res) => {
    fs.readFile(path.join(dirname, `src/frontend/html/${page}.html`), (error, data) => {
      if (error) res.status(500);
      else res.write(data);
      res.end();
    });
  });
}

app.post('/api/register', async (req, res) => {
  const response = await registerUser(req.body.username, req.body.password);
  res.send(response);
});

app.get('*', (req, res) => {
  res.status(404);
  res.end();
});

const server = http.createServer(app);
server.listen(port, () => console.log(`Server is listening to port ${port}`));
