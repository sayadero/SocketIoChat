var socket = io();
let username = '';

login('Enter your username');

socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
});

socket.on('invalid username', function(){
  login(`${username} is not available, please enter another username`);
});

function login(loginMessage) {
  username = '';
  do {
    username = prompt(loginMessage, '');
    if (username) {
      socket.emit('username login', username);
    }
  } while (!username);
}

function sendMessage() {
  const messageInput = document.querySelector('#messageInput');
  if (messageInput) {
    socket.emit('chat message', { username: username, message: messageInput.value });
    messageInput.value = '';
  }
  return false;
}

window.onbeforeunload = function() {
  socket.emit('username logout', username);
}