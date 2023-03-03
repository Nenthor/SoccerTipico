//Register
const username_input = document.getElementById('username');
const password_input = document.getElementById('password');
const submit = document.getElementById('register_submit');

let is_registering = false;

submit.addEventListener('click', e => {
  if(is_registering){
    onErrorMessage("Warte bis die vorherige Anfrage abgeschlossen ist.");
    return;
  }
  const username = username_input.value;
  const password = password_input.value;

  if (username.trim() == "" || password.trim() == "") {
    onErrorMessage("Fülle das Formular aus.");
    return;
  }

  is_registering = true;
  TryAddNewUser(username, password);
})


async function TryAddNewUser(username, password){
  const response = await fetch("/api/register", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });
  
  const data = await response.json();

  if(!data.success) {
    onErrorMessage(data.error);
  } else {
    //Create cookie
    //Redirect
  }
  console.log(data);
  is_registering = false;
}

const error_msg = document.getElementById('register_error')
let error_timeout = null;
function onErrorMessage(msg){
  if(error_timeout) clearTimeout(error_timeout);

  error_msg.textContent = msg;
  error_timeout = setTimeout(() => {
    error_msg.textContent = "";
  }, 5000) // 5s
}

//footer
const footer_text = document.getElementById('footer_text');
footer_text.textContent += ` | ${new Date().getFullYear()}`;
