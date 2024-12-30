const socket = io();

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const typingText = document.createElement('p');
// Prompt user for their name when they connect
const username = prompt('Enter your name:');
if (username.trim() !== '') {
    socket.emit('setUsername', username); // Send name to the server
}

// Send chat messages
const sendMessage = ()=>{
    const message = messageInput.value;
    if (message.trim() !== '') {
        socket.emit('chatMessage', { username, message }); // Send message with username
        messageInput.value = ''; // Clear input
    }
}
messageInput.addEventListener('keydown', (e) => {
    if(e.key === "Enter"){
        e.preventDefault()
        sendButton.click()
    }
})
messageInput.addEventListener('input',() => {
    if(messageInput.value.trim() != ''){
        socket.emit('typing')
    }
    socket.emit('stopTyping')
})

socket.on('typing', username => {
    typingText.textContent = `${username} is typing...`;
})
socket.on('notTyping', () => {
    typingText.textContent = ''
})
sendButton.addEventListener('click', sendMessage);

// Display chat messages

// Display user join/leave notifications
socket.on('notification', (data) => {
    const notificationElement = document.createElement('p');
    notificationElement.textContent = data.message;
    notificationElement.className = data.type; // 'user-joined' or 'user-left'
    chatBox.appendChild(notificationElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('chatMessage', (data) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = `${data.username}: ${data.message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});