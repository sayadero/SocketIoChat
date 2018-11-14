var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

class UserSocket {
  constructor(username, socket) {
    this.username = username;
    this.socket = socket;
  }

  isUsername(username) {
    return this.username === username;
  }
}

class UserSocketList {
  constructor() {
    this.users = [];
  }

  findUser(username) {
    return this.users.find(user => user.isUsername(username));
  }

  findUserIndex(username) {
    return this.users.findIndex(user => user.isUsername(username));
  }

  push(userSocket) {
    this.users.push(userSocket);
  }

  removeUser(username) {
    const userIndex = this.findUserIndex(username);
    return userIndex >= 0 && this.users.splice(userIndex, 1);
  }
}

let users = new UserSocketList();

app.use(express.static('chat'));
app.get('/chat/chat.css', function(req, res){
  console.log(`Sending file: ${__dirname}/chat/chat.css`);
  res.send('chat/chat.css');
  res.end();
});
app.get('/chat/chat.js', function(req, res){
  console.log(`Sending file: ${__dirname}/chat/chat.js`);
  res.send('chat/chat.js');
  res.end();
});

app.get('/', function(req, res){
  console.log(`Sending file: ${__dirname}/index.html`);
  res.sendFile(__dirname + '/chat/index.html');
});

io.on('connection', function(socket){
  console.log('Connection');

  socket.on('username login', function(username) {
    if(users.findUserIndex(username) < 0) {
      console.log(`User ${username} connected`);
      users.push(new UserSocket(username, socket));
      socket.broadcast.emit('chat message', `User ${username} connected`);
      socket.emit('chat message', 'Welcome to Socket IO Chat')
    } else {
      socket.emit('invalid username');
    }
  });

  socket.on('chat message', function(msg) {
    console.log(msg);
    io.emit('chat message', `${msg.username}: ${msg.message}`);
  });

  socket.on('username logout', function(username) {
    console.log(`User ${username} disconnected`)
    users.removeUser(username);
    socket.broadcast.emit('chat message', `User ${username} disconnected`);
  });

  socket.on('disconnect', function() {
    console.log('Disconnect');
  });
});

http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});