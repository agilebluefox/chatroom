'use strict';
'use strict()';

$(document).ready(function () {
    var nickname = prompt('Got a nickname?') || 'anonymous';
    var socket = io();
    var users = $('#usernames');
    var numUsers = $('#num-users');
    var form = $('form');
    var input = $('#m');
    var messages = $('#messages');

    // Expects an object to be passed with the message and sender
    var addMessage = function addMessage(message) {
        messages.append('<li> ' + message.nickname + ': ' + message.message + ' </li>');
        console.log(message);
    };

    var logUsers = function logUsers(loggedInUsers) {
        users.empty();
        $.each(loggedInUsers, function (index, user) {
            users.append('<li> ' + user.nickname + '</li>');
            console.log('The user id for ' + user.nickname + ' is ' + user.id);
        });
        numUsers.text(loggedInUsers.length);
    };

    socket.on('user', function (users) {
        console.log(users);
        logUsers(users);
    });

    socket.on('connect', function () {
        console.log(socket.id);
        socket.emit('identify', { nickname: nickname, message: 'has entered the room' });
    });

    socket.on('message', addMessage);

    socket.on('disconnect', function (users) {
        logUsers(users);
    });

    form.on('keydown', function (event) {
        // event.preventDefault();
        if (event.keyCode != 13) {
            return;
        }

        // Send an object with the sender and the message
        var message = {
            nickname: nickname,
            message: input.val()
        };
        if (message) {
            addMessage(message);
            socket.emit('message', message);
        }
        input.val('');
        return false;
    });
});
