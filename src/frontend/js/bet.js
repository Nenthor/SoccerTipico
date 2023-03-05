//Server data
var socket = new WebSocket(`wss://${location.host}`);
let user = { username: '', points: 0, default_points: 0, bets: '' };
let bet = { id: '', question: '', type: '', timelimit: new Date() };
let choices = [{answer: "", points: 0}]

addSocketEvents();
function addSocketEvents() {
  socket.addEventListener(
    'open',
    () => {
      const params = new URLSearchParams(document.location.search);
      send(`get_default_bet:${params.get("id")}`);
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
          break;
        case 'bet':
          bet = data[1] != '' ? JSON.parse(data[1]) : null;
          choices = bet != null ? JSON.parse(bet.choices) : null;
          
          updateTitle();
          updateStats();
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
      socket = new WebSocket(`wss://${location.host}`);
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

//Bet
const bet_title = document.getElementById('bet_title');
const bet_list = document.getElementById('bet_answer_list');
const bet_answers = document.getElementsByClassName('bet_answer');

function updateTitle(){
  bet_title.textContent = bet != null ? bet.question : 'Diese Frage existiert nicht.';

}

function updateStats(){
  if(bet == null || choices == null) return;

  let total_value = 0;
  if(bet_answers.length != choices.length){
    bet_list.innerHTML = '';

    const items = [];
    const colors = ['#d03542', '#2b6bc7', '#d09f36', '#468629'];

    for (const index in choices) {
      const item = document.createElement('li');
      item.classList.add('bet_answer');
      item.id = `choice_${choices[index].answer}`;

      if (bet.type == 'yes-no'){
        if(choices[index].answer == 'yes')
          item.style.backgroundColor = '#1e9c1e';
        else if(choices[index].answer == 'no')
          item.style.backgroundColor = '#9c1e1e';
      } else item.style.backgroundColor = colors[index];


      total_value += choices[index].points;
      bet_list.appendChild(item);
      items.push(item);
    }
    for (const index in items) {
      items[index].style.flexGrow = `${choices[index].points / total_value}`;
    }
  } else {
    for (const choice of choices) total_value += choice.points;
    for (const index in choices) {
      bet_answers[index].style.flexGrow = choices[index].points / total_value;
    }
  }

  const bet_pot_value = document.getElementById('bet_value');

  if(total_value >= 1000){
    const value_string = total_value.toString();
    const value_thousand = value_string.substring(0, value_string.length - 3);
    const value_houndred = value_string.substring(value_string.length - 3, value_string.length - 2);
    total_value = `${value_thousand},${value_houndred}k`;
  }

  if(bet_pot_value) bet_pot_value.innerHTML = `Im Topf:<br><span style="color:#ebc107">${total_value}</span>`;
}
