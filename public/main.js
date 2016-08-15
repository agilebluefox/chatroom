'use strict';
'use strict()';

$(document).ready(function () {
    // Initialize variables
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $usernames = $('.usernames'); //List of active users
    var $error = $('.error'); // Username error
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $currentInput = $usernameInput.focus();

    var username = null;
    var socket = io();

    $window.on('keydown', function (event) {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }

        if (event.which === 13) {
            if (username) {
                sendMessage();
            } else {
                setUsername();
            }
        }
    });

    // Get the username val from the input
    // Check that it's unique
    function setUsername() {
        username = $usernameInput.val().trim();
        socket.emit('add user', username, function (data) {
            if (data.isValid) {
                $loginPage.fadeOut();
                $chatPage.show();
                $loginPage.off('click');
                $currentInput = $inputMessage.focus();
            } else {
                username = null;
                $usernameInput.val('');
                $error.html('Username already taken. Try again.');
                $currentInput = $usernameInput.focus();
            }
            return;
        });
    }

    function logUsers(data) {
        $usernames.empty();
        for (var i = 0; i < data.length; i++) {
            $usernames.append('<li><input type="checkbox" name="user" value="' + data[i] + '" /><label>' + data[i] + '</li>');
        }
    }

    function sendMessage() {
        var message = $inputMessage.val().trim();
        var secretFriend = checkForSelectedUsers();
        if (secretFriend) {
            $messages.append('<li class="secret"> ' + username + ' -> ' + secretFriend + ': ' + message + ' </li>');
        } else {
            $messages.append('<li> ' + username + ': ' + message + ' </li>');
            socket.emit('message', message);
        }
        console.log(message);
        $inputMessage.val('');
    }

    // Handle displaying the logged in users
    // let logUsers = function (loggedInUsers) {
    //     users.empty();
    //     for (let i = 0; i < loggedInUsers.length; i++) {
    //         users.append(`<li><input type="checkbox" name="user" value="${loggedInUsers[i]}" /><label>${loggedInUsers[i]}</label></li>`);
    //         console.log(`The user id is ${loggedInUsers[i]}.`);
    //     }
    //     numUsers.text(loggedInUsers.length);
    // };

    var checkForSelectedUsers = function checkForSelectedUsers() {
        if ($("input[name=user]:checked").length > 0) {
            console.log('something is checked');
            var user = $("input[name=user]:checked").val();
            return user;
        } else {
            return false;
        }
    };

    socket.on('message', function (data) {
        $messages.append('<li> ' + data.username + ': ' + data.message + ' </li>');
    });

    socket.on('new user', function (data) {
        logUsers(data);
    });

    socket.on('remove user', function (data) {
        logUsers(data);
    });
});
