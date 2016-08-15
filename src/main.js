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
        for (let username in loggedInUsers) {
            users.append(`<li><input type="checkbox" name="user" value="${username}" /><label>${username}</label></li>`);
            console.log(`The user id for ${username} is ${loggedInUsers[username].id}`);
        }
        numUsers.text(Object.keys(loggedInUsers).length);
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

// TODO: Check to see if a username already exists

    socket.on('message', addMessage);

    socket.on('disconnect', function (users) {
        logUsers(users);
    });

    login.on('keydown', function (event) {
        event.preventDefault();
        if (event.keyCode != 13) {
            return;
        }
        
        socket.emit('add user', { username: userInput.val() }, function(data) {
            if (data.isValid) {
                userForm.hide();
                messageForm.show();
            } else {
                loginError.html('Username already taken. Try again.');
            }
        });
        userInput.val('');
    });

    send.on('keydown', function (event) {
        // event.preventDefault();
        if (event.keyCode != 13) {
            return;
        }

        // Check to see if this is a private message.
        if (checkForSelectedUsers()) {
            console.log(`The ids selected are: ${privateChat}`);
        }

        // Send an object with the sender and the message
        let message = {
            username: username,
            message: messageInput.val()
        };
        if (message) {
            addMessage(message);

            socket.emit('message', message);
        }
        messageInput.val('');
        return false;
    });
});