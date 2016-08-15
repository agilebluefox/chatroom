'use strict()';

$(document).ready(function () {
    let socket = io();
    let users = $('#usernames');
    let numUsers = $('#num-users');
    let send = $('form#send-message');
    let loginForm = $('#loginForm');
    let login = $('form#get-username');
    let loginInput = $('#u');
    let loginError = $('p.error');
    let messageForm = $('#messageForm');
    let messageInput = $('#m');
    let messages = $('#messages');
    let privateChat = [];

    // Expects an object to be passed with the message and sender
    let addMessage = function (message) {
        messages.append(`<li> ${message.username}: ${message.message} </li>`);
        console.log(message);
    };

// Handle displaying the logged in users
    let logUsers = function (loggedInUsers) {
        users.empty();
        for (let i = 0; i < loggedInUsers.length; i++) {
            users.append(`<li><input type="checkbox" name="user" value="${loggedInUsers[i]}" /><label>${loggedInUsers[i]}</label></li>`);
            console.log(`The user id is ${loggedInUsers[i]}.`);
        }
        numUsers.text(loggedInUsers.length);
    };

    let checkForSelectedUsers = function () {
        if ($("input:checked").length > 0) {
            $("input:checked").each(function (index, user) {
                privateChat.push($(this).val());
            });
            return true;
        }
        else {
            return false;
        }
    };

    socket.on('user', function (users) {
        console.log(users);
        logUsers(users);
    });

    socket.on('message', addMessage);

    socket.on('disconnect', function (data) {
        data.message = 'has left the room';
        addMessage(data);
        logUsers(data.users);
    });

    login.on('keydown', function (event) {
        if (event.keyCode != 13) {
            return;
        }
        // event.preventDefault();
        
        socket.emit('add user', { username: loginInput.val() }, function(data) {
            if (data.isValid) {
                loginForm.hide();
                messageForm.show();
            } else {
                loginError.html('Username already taken. Try again.');
            }
        });
        loginInput.val('');
        return false;
    });

    send.on('keydown', function (event) {
        if (event.keyCode != 13) {
            return;
        }
        // event.preventDefault();

        // Check to see if this is a private message.
        if (checkForSelectedUsers()) {
            console.log(`The ids selected are: ${privateChat}`);
        }

        // Send an object with the sender and the message
        let message = messageInput.val();
        console.log(socket.username);
        let data = {
                username: socket.username,
                message: message
            };
        if (message) {
            addMessage(data);
            socket.emit('message', data);
        }
        messageInput.val('');
        return false;
    });
});