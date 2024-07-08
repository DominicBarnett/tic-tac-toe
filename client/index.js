$(document).ready(() => {
    const socket = io.connect();
  
    // Keep track of the current user
    let currentUser;
  
    $('#create-user-btn').click((e) => {
        e.preventDefault();
        if ($('#username-input').val().length > 0) {
            const username = $('#username-input').val();
            socket.emit('new user', username);
            // Save the current user when created
            currentUser = username;
            $('.username-form').remove();
            $('.main-container').css('display', 'flex');
        }
    });
  
    $('#send-chat-btn').click((e) => {
        e.preventDefault();
        // Get the message text value
        let message = $('#chat-input').val();
        // Make sure it's not empty
        if (message.length > 0) {
            // Emit the message with the current user to the server
            socket.emit('new message', {
                sender: currentUser,
                message: message,
            });
            $('#chat-input').val("");
        }
    });
  });
  
  // Socket listeners
  const socket = io.connect();
  
  socket.on('new user', (username) => {
    console.log(`${username} has joined the chat`);
    $('.users-online').append(`<div class="user-online">${username}</div>`);
  });
  
  // Output the new message
  socket.on('new message', (data) => {
    $('.message-container').append(`
        <div class="message">
            <p class="message-user">${data.sender}: </p>
            <p class="message-text">${data.message}</p>
        </div>
    `);
  });
  