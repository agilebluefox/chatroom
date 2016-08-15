'use strict';
'use strict()';

$(document).ready(function () {
    var socket = io();
    var users = $('#usernames');
    var numUsers = $('#num-users');
    var form = $('form#send-message');
    var loginForm = $('#loginForm');
    var login = $('form#get-username');
    var userInput = $('#u');
    var loginError = $('p.error');
    var messageForm = $('#messageForm');
    var input = $('#m');
    var messages = $('#messages');
    var privateChat = [];

    // Expects an object to be passed with the message and sender
    var addMessage = function addMessage(message) {
        messages.append('<li> ' + message.username + ': ' + message.message + ' </li>');
        console.log(message);
    };

    // Handle displaying the logged in users
    var logUsers = function logUsers(loggedInUsers) {
        users.empty();
        for (var _username in loggedInUsers) {
            users.append('<li><input type="checkbox" name="user" value="' + _username + '" /><label>' + _username + '</label></li>');
            console.log('The user id for ' + _username + ' is ' + loggedInUsers[_username].id);
        }
        numUsers.text(Object.keys(loggedInUsers).length);
    };

    var checkForSelectedUsers = function checkForSelectedUsers() {
        if ($("input:checked").length > 0) {
            $("input:checked").each(function (index, user) {
                privateChat.push($(this).val());
            });
            return true;
        } else {
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

        socket.emit('add user', { username: userInput.val() }, function (data) {
            if (data.isValid) {
                userForm.hide();
                messageForm.show();
            } else {
                loginError.html('Username already taken. Try again.');
            }
        });
        userInput.val('');
    });

    form.on('keydown', function (event) {
        // event.preventDefault();
        if (event.keyCode != 13) {
            return;
        }

        // Check to see if this is a private message.
        if (checkForSelectedUsers()) {
            console.log('The ids selected are: ' + privateChat);
        }

        // Send an object with the sender and the message
        var message = {
            username: username,
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
