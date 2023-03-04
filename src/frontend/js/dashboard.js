
//Logout
const logout = document.getElementById('logout');
let waiting = false;
logout.addEventListener('click', () => {
  if(waiting) return;
  waiting = true;
  fetch(`/api/logout`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then(async response =>  {
    const data = await response.json();
    if(!data.success) {
      onErrorMessage(data.error);
    } else {
      window.location.href = '/login';
    }
    waiting = false;
  }).catch(err => {
    onErrorMessage('Der Server ist momentan überlastet.');
    waiting = false;
  });
});

function onErrorMessage(msg){
  console.log(msg);
}
