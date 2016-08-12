'use strict()';

$(document).ready(function () {
    let nickname = prompt('Got a nickname?') || 'anonymous';
    let socket = io();
    let users = $('#usernames');
    let numUsers = $('#num-users');
    let form = $('form');
    let input = $('#m');
    let messages = $('#messages');

    // Expects an object to be passed with the message and sender
    let addMessage = function (message) {
        messages.append(`<li> ${message.nickname}: ${message.message} </li>`);
        console.log(message);
    };

    let logUsers = function (loggedInUsers) {
        users.empty();
        $.each(loggedInUsers, function (index, user) {
            users.append(`<li> ${user.nickname}</li>`);
            console.log(`The user id for ${user.nickname} is ${user.id}`);
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
        let message = {
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