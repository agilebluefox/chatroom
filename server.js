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
// TODO: Send the current users to prevent duplicate usernames
io.on('connection', function (socket) {

    // Upon login, get the username of the user and notify all connected users 
    socket.on('add user', function (data, callback) {
        var username = data.username;
        console.log(username);
        if (users.indexOf(username) !== -1) {
            callback({ isValid: false });
        } else {
            callback({ isValid: true });
            numberOfConnections += 1;
            console.log(numberOfConnections);
            logNumberClients(numberOfConnections);
            socket.username = username;
            users.push(socket.username);
            io.emit('user', users);
            var message = {
                username: username,
                message: 'has joined the conversation'
            };
            socket.broadcast.emit('message', message);
        }
    });

    // When a message is sent broadcast it to all the connected users
    socket.on('message', function (message) {
        console.log(message.username + ' says \'' + message.message + '\'');
        socket.broadcast.emit('message', message);
    });

    // When a socket is closed, remove the user from the object of logged in users
    socket.on('disconnect', function () {
        var index = users.indexOf(socket.username);
        users.splice(index, 1);
        console.log(socket.username + ' has left the room.');
        socket.broadcast.emit('disconnect', {
            username: socket.username,
            users: users
        });
        --numberOfConnections;
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
