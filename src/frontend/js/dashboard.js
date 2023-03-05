//Logout
const logout = document.getElementById('logout');
let waiting = false;
logout.addEventListener('click', () => {
  if (waiting) return;
  waiting = true;
  fetch(`/api/logout`, {
    method: 'POST',
    headers: { Accept: 'application/json' }
  })
    .then(async (response) => {
      const data = await response.json();

      if (!data.success) onErrorMessage(data.error);
      else window.location.href = '/login';

      waiting = false;
    })
    .catch((err) => {
      onErrorMessage('Der Server ist momentan überlastet.');
      waiting = false;
    });
});

//Server data
var socket = new WebSocket(`ws://${location.host}`);
let user = { username: '', points: 0, default_points: 0, bets: '' };
let open_bets = [{ id: '', question: '', choices: 0, timelimit: new Date() }];

addSocketEvents();
function addSocketEvents() {
  socket.addEventListener(
    'open',
    () => {
      send('get_default');
    },
    { passive: true }
  );

  socket.addEventListener('close', () => {
    console.warn('Server has closed. Retrying...');
    reconnect();
  });

  socket.addEventListener(
    'message',
    (event) => {
      const data = String(event.data).split('=');
      switch (data[0]) {
        case 'stats':
          user = JSON.parse(data[1]);
          updateUsername();
          updateStats();
          break;
        case 'open_bets':
          open_bets = JSON.parse(data[1]);
          updateOpenBets();
          break;
        default:
          break;
      }
    },
    { passive: true }
  );
}

function reconnect() {
  fetch(`${location.protocol}//${location.host}`, { method: 'GET' })
    .then(() => {
      socket = new WebSocket(`ws://${location.host}`);
      addSocketEvents();
      console.log('Reconnected to Server.');
    })
    .catch(() => {
      setTimeout(() => {
        reconnect();
      }, 1000); // 1s
    });
}

function send(message) {
  socket.send(message);
}

function onErrorMessage(msg) {
  console.log(msg);
}

//Dashboard
const dashboard_title = document.getElementById('dashboard_title');
const placed_value = document.getElementById('placed_bets_value');
const deposit = document.getElementById('deposit_value');
const profit = document.getElementById('profit_value');
const profit_background = document.getElementById('profit');
const open_bets_list = document.getElementById('open_bets');

function updateUsername() {
  dashboard_title.innerHTML = `Portfolio von <span style="color:#3bc5e7">${user.username}</span>`;
}

function updateStats() {
  deposit.textContent = user.points;

  const profit_value = parseInt(user.points) - parseInt(user.default_points);

  if (profit_value >= 0) {
    profit_background.style.backgroundColor = '#1e9c1e';
    profit.textContent = `+${profit_value}`;
  } else {
    profit_background.style.backgroundColor = '#9c1e1e';
    profit.textContent = profit_value;
  }
}

function updateOpenBets() {
  open_bets_list.innerHTML = '';
  for (const bet of open_bets) {
    const remaining_time = ((new Date(bet.timelimit) - new Date()) / 1000 / 60).toFixed();
    console.log(remaining_time);
    open_bets_list.insertAdjacentHTML('beforeend', `<li class="bet_item" id="bet_open_${bet.id}"><p class="bet_item_title">${bet.question} [noch ${remaining_time} min]</p></li>`);

    const bet_element = document.getElementById(`bet_open_${bet.id}`);
    bet_element.addEventListener('click', () => onOpenBetSelect(bet.id));
  }
}

function onOpenBetSelect(id) {
  console.log(id);
}
