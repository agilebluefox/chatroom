'use strict';
"use strict()";

// Get the required modules

var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

// Setup an express app
var app = express();
app.use(express.static('./public'));

/**
 * This app needs to support bidirectional communication so a Client
 * can maintain a connection with the server. When new data is 
 * available it will be pushed to the client.
 */
// Wrap the app in an http server
var server = http.Server(app);
// Then wrap the server in socket io
var io = socket_io(server);

// Counter to track client connections
var numberOfConnections = 0;
var users = [];

// When a connection event occurs...
io.on('connection', function (socket) {
    numberOfConnections += 1;
    logNumberClients(numberOfConnections);

    // Upon login, get the nickname of the user and notify all connected users 
    socket.on('identify', function (data) {

        console.log(data.nickname + ' ' + data.message);
        users.push({
            nickname: data.nickname,
            id: socket.id
        });
        io.emit('user', users);
        socket.broadcast.emit('message', data);
    });

    // When a message is sent broadcast it to all the connected users
    socket.on('message', function (message) {
        console.log(message.nickname + ' says \'' + message.message + '\'');
        socket.broadcast.emit('message', message);
    });

    // When a socket is closed, remove the user from the list of logged in users
    socket.on('disconnect', function () {
        var userIndex = null;
        users.forEach(function (user, index, array) {
            if (user.id === socket.id) {
                userIndex = index;
                var message = {
                    nickname: user.nickname,
                    message: 'has left the room'
                };
                io.emit('message', message);
                return;
            }
        });

        users.splice(userIndex, 1);
        io.emit('disconnect', users);
        numberOfConnections -= 1;
        logNumberClients(numberOfConnections);
    });
});

// Log the number of current users to the console
function logNumberClients(connections) {

    if (connections === 1) {
        console.log('There is ' + connections + ' client connected.');
    } else if (connections > 1) {
        console.log('There are ' + connections + ' clients connected.');
    } else {
        console.log('No users are logged in.');
    }
}

// Start listening on this port
server.listen(8888);
