'use strict';

$(document).ready(function(){
    let input = $('input');
    let messages = $('#messages');

    let addMessage = function(message) {
        messages.append(`<div> ${message} </div>`);
    };

    input.on('keydown', function (event) {
        if (event.keyCode != 13) {
            return;
        }

        let message = input.val();
        addMessage(message);
        input.val('');
    });
});