"use strict()";

// Get the required modules
const socket_io = require('socket.io');
const http = require('http');
const express = require('express');

// Setup an express app
let app = express();
app.use(express.static('./public'));

/**
 * This app needs to support bidirectional communication so a Client
 * can maintain a connection with the server. When new data is 
 * available it will be pushed to the client.
 */
// Wrap the app in an http server
let server = http.Server(app);
// Then wrap the server in socket io
let io = socket_io(server);

// Counter to track client connections
let numberOfConnections = 0;
let users = [];

// When a connection event occurs...
// TODO: Send the current users to prevent duplicate usernames
io.on('connection', function (socket) {
    numberOfConnections += 1;
    logNumberClients(numberOfConnections);

    // Upon login, get the username of the user and notify all connected users 
    socket.on('add user', function (data, callback) {
        let username = data.username;
        if (users.indexOf(username) !== -1) {
            callback({ isValid: false });
        } else {
            callback({ isValid: true });
            socket.username = username;
            users.push(socket.username);
            io.emit('user', users);
            socket.broadcast.emit('message', data);
        }
    });

    // When a message is sent broadcast it to all the connected users
    socket.on('message', function (message) {
        console.log(`${message.username} says '${message.message}'`);
        socket.broadcast.emit('message', message);
    });

    // When a socket is closed, remove the user from the object of logged in users
    socket.on('disconnect', function () {
        let message = {};
        for (let prop in users) {
            if (users[prop] === socket.username) {
                delete users[prop];
                message = {
                    username: users[prop],
                    message: 'has left the room'
                };
                console.log(`${message.username} ${message.message}`);
                io.emit('message', message);
                return;
            }

        }

        io.emit('disconnect', users);
        numberOfConnections -= 1;
        logNumberClients(numberOfConnections);
    });
});

// Log the number of current users to the console
function logNumberClients(connections) {

    if (connections === 1) {
        console.log(`There is ${connections} client connected.`);

    } else if (connections > 1) {
        console.log(`There are ${connections} clients connected.`);
    } else {
        console.log('No users are logged in.');
    }
}

// Start listening on this port
server.listen(8888);
