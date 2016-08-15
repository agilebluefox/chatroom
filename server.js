'use strict';
"use strict()";

// Get the required modules

var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

// Setup an express app
var app = express();
app.use(express.static(__dirname + '/public'));

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
    console.log('Client connected...');

    socket.on('add user', function (username, callback) {
        if (users.indexOf(username) === -1) {
            users.push(username);
            socket.username = username;
            callback({ isValid: true });
            console.log(username + ' joined the conversation');
            io.emit('new user', users);
        } else {
            callback({ isValid: false });
        }
    });

    socket.on('message', function (data) {
        socket.broadcast.emit('message', {
            username: socket.username,
            message: data
        });
    });

    socket.on('disconnect', function () {
        if (!socket.username) return;
        console.log(socket.username + ' has left the room');
        users.splice(users.indexOf(socket.username), 1);
        io.emit('remove user', users);
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
server.listen(8888, function () {
    console.log('The server is running...');
});
