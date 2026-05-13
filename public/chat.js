class ChatApp {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.currentRoom = 'general';
        this.isConnected = false;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Join form elements
        this.joinForm = document.getElementById('join-form');
        this.usernameInput = document.getElementById('username-input');
        this.roomInput = document.getElementById('room-input');
        this.joinBtn = document.getElementById('join-btn');

        // Chat interface elements
        this.chatInterface = document.getElementById('chat-interface');
        this.messagesContainer = document.getElementById('messages-container');
        this.messages = document.getElementById('messages');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');

        // Sidebar elements
        this.currentUserEl = document.getElementById('current-user');
        this.currentRoomEl = document.getElementById('current-room');
        this.userCountEl = document.getElementById('user-count');
        this.usersList = document.getElementById('users-list');
    }

    attachEventListeners() {
        this.joinBtn.addEventListener('click', () => this.joinChat());
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinChat();
        });
        this.roomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinChat();
        });

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    joinChat() {
        const username = this.usernameInput.value.trim();
        const room = this.roomInput.value.trim() || 'general';

        if (!username) {
            this.showError('Please enter a username');
            return;
        }

        if (username.length < 2 || username.length > 20) {
            this.showError('Username must be between 2 and 20 characters');
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            this.showError('Username can only contain letters, numbers, underscores, and hyphens');
            return;
        }

        this.currentRoom = room;
        this.connectWebSocket(username, room);
    }

    connectWebSocket(username, room) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('Connected to WebSocket');
            this.isConnected = true;
            
            // Join the room
            this.socket.send(JSON.stringify({
                type: 'join',
                username: username,
                room: room
            }));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            console.log('Disconnected from WebSocket');
            this.isConnected = false;
            this.showError('Connection lost. Please refresh the page.');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showError('Connection error. Please try again.');
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'joined':
                this.handleJoined(data);
                break;
            case 'message_history':
                this.handleMessageHistory(data);
                break;
            case 'room_users':
                this.handleRoomUsers(data);
                break;
            case 'new_message':
                this.handleNewMessage(data);
                break;
            case 'user_joined':
                this.handleUserJoined(data);
                break;
            case 'user_left':
                this.handleUserLeft(data);
                break;
            case 'error':
                this.showError(data.message);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    handleJoined(data) {
        this.currentUser = data.user;
        this.currentRoom = data.room;
        
        // Update UI
        this.currentUserEl.textContent = this.currentUser.username;
        this.currentRoomEl.textContent = this.currentRoom;
        
        // Switch to chat interface
        this.joinForm.style.display = 'none';
        this.chatInterface.style.display = 'flex';
        
        // Focus on message input
        this.messageInput.focus();
    }

    handleMessageHistory(data) {
        this.messages.innerHTML = '';
        data.messages.forEach(message => {
            this.displayMessage(message);
        });
        this.scrollToBottom();
    }

    handleRoomUsers(data) {
        this.updateUsersList(data.users);
    }

    handleNewMessage(data) {
        this.displayMessage(data.message);
        this.scrollToBottom();
    }

    handleUserJoined(data) {
        this.addSystemMessage(`${data.user.username} joined the room`);
        // Update users list will be handled by a separate message
    }

    handleUserLeft(data) {
        this.addSystemMessage(`${data.user.username} left the room`);
        // Update users list will be handled by a separate message
    }

    displayMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.username === this.currentUser.username ? 'own' : 'other'}`;
        
        const headerEl = document.createElement('div');
        headerEl.className = 'message-header';
        headerEl.textContent = `${message.username} • ${this.formatTime(message.timestamp)}`;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.textContent = message.content;
        
        messageEl.appendChild(headerEl);
        messageEl.appendChild(contentEl);
        
        this.messages.appendChild(messageEl);
    }

    addSystemMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'system-message';
        messageEl.textContent = text;
        this.messages.appendChild(messageEl);
        this.scrollToBottom();
    }

    updateUsersList(users) {
        this.usersList.innerHTML = '';
        this.userCountEl.textContent = users.length;
        
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.username;
            if (user.username === this.currentUser.username) {
                li.style.fontWeight = 'bold';
                li.textContent += ' (you)';
            }
            this.usersList.appendChild(li);
        });
    }

    sendMessage() {
        const content = this.messageInput.value.trim();
        
        if (!content) return;
        
        if (!this.isConnected) {
            this.showError('Not connected to server');
            return;
        }

        this.socket.send(JSON.stringify({
            type: 'message',
            content: content
        }));

        this.messageInput.value = '';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showError(message) {
        // Remove existing error messages
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());

        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        
        if (this.joinForm.style.display !== 'none') {
            this.joinForm.appendChild(errorEl);
        } else {
            this.chatInterface.insertBefore(errorEl, this.messagesContainer);
        }

        // Auto-remove error after 5 seconds
        setTimeout(() => {
            errorEl.remove();
        }, 5000);
    }
}

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});