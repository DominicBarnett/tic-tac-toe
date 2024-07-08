const url = window.location.origin;
let socket = io.connect(url);

var myTurn = true;
var symbol;
let currentUser;

function getBoardState() {
  var obj = {};

  $(".board button").each(function() {
    obj[$(this).attr("id")] = $(this).text() || "";
  });

  return obj;
}

function isGameOver() {
    var state = getBoardState();
    var matches = ["XXX", "OOO"];

    var rows = [
      state.r0c0 + state.r0c1 + state.r0c2,
      state.r1c0 + state.r1c1 + state.r1c2,
      state.r2c0 + state.r2c1 + state.r2c2,
      state.r0c0 + state.r1c0 + state.r2c0,
      state.r0c1 + state.r1c1 + state.r2c1,
      state.r0c2 + state.r1c2 + state.r2c2,
      state.r0c0 + state.r1c1 + state.r2c2,
      state.r0c2 + state.r1c1 + state.r2c0
    ];

    for (var i = 0; i < rows.length; i++) {
        if (rows[i] === matches[0] || rows[i] === matches[1]) {
            return true;
        }
    }

    return false;
}

function renderTurnMessage() {
    if (!myTurn) {
        $("#message").text("Your opponent's turn");
        $(".board button").attr("disabled", true);
    } else {
        $("#message").text("Your turn.");
        $(".board button").removeAttr("disabled");
    }
}

function makeMove(e) {
    if (!myTurn) {
        return;
    }

    if ($(this).text().length) {
        return;
    }

    socket.emit("make.move", {
        symbol: symbol,
        position: $(this).attr("id")
    });
}

socket.on("move.made", function(data) {
    $("#" + data.position).text(data.symbol);

    myTurn = data.symbol !== symbol;

    if (!isGameOver()) {
        renderTurnMessage();
    } else {
        if (myTurn) {
            $("#message").text("You lost.");
        } else {
            $("#message").text("You won!");
        }

        $(".board button").attr("disabled", true);
    }
});

socket.on("game.begin", function(data) {
    symbol = data.symbol;
    myTurn = symbol === "X";
    renderTurnMessage();
});

socket.on("opponent.left", function() {
    $("#message").text("Your opponent left the game.");
    $(".board button").attr("disabled", true);
});

$(function() {
  $(".board button").attr("disabled", true);
  $(".board> button").on("click", makeMove);
});

$(document).ready(() => {
    $('#create-user-btn').click((e) => {
        e.preventDefault();
        if ($('#username-input').val().length > 0) {
            const username = $('#username-input').val();
            socket.emit('new user', username);
            currentUser = username;
            $('.username-form').remove();
            $('.main-container').css('display', 'flex');
        }
    });

    $('#send-chat-btn').click((e) => {
        e.preventDefault();
        let message = $('#chat-input').val();
        if (message.length > 0) {
            socket.emit('new message', {
                sender: currentUser,
                message: message,
            });
            $('#chat-input').val("");
        }
    });
});

socket.on('new user', (username) => {
    console.log(`${username} has joined the chat`);
    $('.users-online').append(`<div class="user-online">${username}</div>`);
});

socket.on('new message', (data) => {
    $('.message-container').append(`
        <div class="message">
            <p class="message-user">${data.sender}: </p>
            <p class="message-text">${data.message}</p>
        </div>
    `);
});
