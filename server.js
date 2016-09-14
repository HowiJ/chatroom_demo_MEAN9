//Socket chatroom
//require dependencies
var express = require('express'),
    path    = require('path'),
    app     = express();

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
})

var server = app.listen(8000, function() {
    console.log('Chatroom Demo 20160913 on port 8000');
})

var io = require('socket.io').listen(server);

var messages = [],
    users    = {};

io.sockets.on('connection', function(socket) {
    console.log(socket);
    socket.on('user_entered', function(data) {
        console.log(data);
        if (!data.name) {
            socket.emit('bad_name', {success:false});
        } else {
            //sets a  new user in the object
            users[socket.id] = data.name;
            console.log(users);
            //creates a new message
            messages.push({name: users[socket.id], message: 'has connected.'});
            console.log(messages);
            //sends out the updated users object
            io.emit('user', {users: users});
            //sends out the updated messages array
            io.emit('message', {messages: messages});
        }
    })
    //client sent message
    socket.on('client_send', function(data) {
        console.log(data);
        data.message.split('<').join(' ');
        messages.push({name: users[socket.id], message: data.message});
        io.emit('message', {messages: messages});
    })
    socket.on('disconnect', function() {
        if (users[socket.id]) {
            //nice javascript function
            messages.push({name: users[socket.id], message: 'has disconnected.'});
            //deletes the user from the object;
            delete users[socket.id];
            //sends out new data
            io.emit('user', {users: users});
            io.emit('message', {messages: messages});
        }
    })
})
