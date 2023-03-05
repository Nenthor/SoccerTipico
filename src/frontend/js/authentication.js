//Authentication
const username_input = document.getElementById('username');
const password_input = document.getElementById('password');
const form = document.getElementById('form_box');

const type = window.location.pathname.substring(1);
let waiting = false;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (waiting) {
    onErrorMessage('Warte bis die vorherige Anfrage abgeschlossen ist.');
    return;
  }
  const username = username_input.value;
  const password = password_input.value;

  if (username.trim() == '' || password.trim() == '') {
    onErrorMessage('Fülle das Formular aus.');
    return;
  }

  waiting = true;
  TryAuthentication(username, password);
});

function TryAuthentication(username, password) {
  fetch(`/api/${type}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
    .then(async (response) => {
      const data = await response.json();
      if (!data.success) {
        onErrorMessage(data.error);
      } else {
        window.location.href = '/';
      }
      waiting = false;
    })
    .catch((err) => {
      onErrorMessage('Der Server ist momentan überlastet.');
      waiting = false;
    });
}

const error_msg = document.getElementById('form_error');
let error_timeout = null;
function onErrorMessage(msg) {
  if (error_timeout) clearTimeout(error_timeout);

  error_msg.textContent = msg;
  error_timeout = setTimeout(() => {
    error_msg.textContent = '';
  }, 5000); // 5s
}
