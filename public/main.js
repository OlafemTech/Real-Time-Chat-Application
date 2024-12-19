const socket = io();

// DOM elements
const loginForm = document.getElementById('join-form');
const chatContainer = document.getElementById('chat-container');
const loginContainer = document.getElementById('login-form');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const usersList = document.getElementById('users-list');
const roomNameDisplay = document.querySelector('.room-name');
const typingIndicator = document.getElementById('typing-indicator');
const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
const editProfileBtn = document.querySelector('.edit-profile-btn');
const regenerateAvatarBtn = document.querySelector('.regenerate-avatar');
const saveProfileBtn = document.querySelector('.save-profile');
const userAvatar = document.getElementById('user-avatar');
const modalAvatar = document.getElementById('modal-avatar');
const displayNameInput = document.getElementById('display-name');
const userStatusSelect = document.getElementById('user-status');
const userProfileMini = document.getElementById('current-user-profile');
const activeUsersCount = document.querySelector('.active-users-count .count');

let username = '';
let room = '';
let typingTimeout;

let userProfile = {
    avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${Math.random()}`,
    status: 'online'
};

// Initialize profile
function initializeProfile() {
    userAvatar.src = userProfile.avatar;
    modalAvatar.src = userProfile.avatar;
    document.querySelector('.username').textContent = username;
    displayNameInput.value = username;
}

// Join chat handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = document.getElementById('username').value.trim();
    room = document.getElementById('room').value.trim();

    if (username && room) {
        userProfile.avatar = `https://api.dicebear.com/6.x/avataaars/svg?seed=${username}`;
        socket.emit('join', { 
            username, 
            room,
            avatar: userProfile.avatar,
            status: userProfile.status
        });
        
        loginContainer.classList.add('d-none');
        chatContainer.classList.remove('d-none');
        
        roomNameDisplay.textContent = `Room: ${room}`;
        initializeProfile();
        messageInput.focus();
    }
});

// Send message handler
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
        messageInput.focus();
    }
});

// Add typing event listener
messageInput.addEventListener('input', () => {
    if (!typingTimeout) {
        socket.emit('typing', { username, room });
    }
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping', { username, room });
        typingTimeout = null;
    }, 1000);
});

// Edit Profile Button Handler
editProfileBtn.addEventListener('click', () => {
    modalAvatar.src = userProfile.avatar;
    displayNameInput.value = username;
    userStatusSelect.value = userProfile.status;
    profileModal.show();
});

// Regenerate Avatar
regenerateAvatarBtn.addEventListener('click', () => {
    const newAvatar = `https://api.dicebear.com/6.x/avataaars/svg?seed=${Math.random()}`;
    modalAvatar.src = newAvatar;
    modalAvatar.style.animation = 'none';
    modalAvatar.offsetHeight; // Trigger reflow
    modalAvatar.style.animation = 'messagePopIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
});

// Save Profile Changes
saveProfileBtn.addEventListener('click', () => {
    const newUsername = displayNameInput.value.trim();
    const newStatus = userStatusSelect.value;
    
    if (newUsername) {
        username = newUsername;
        userProfile.avatar = modalAvatar.src;
        userProfile.status = newStatus;
        
        // Update UI
        document.querySelector('.username').textContent = username;
        userAvatar.src = userProfile.avatar;
        updateStatusIndicator(newStatus);
        
        // Emit profile update
        socket.emit('profileUpdate', {
            username: username,
            avatar: userProfile.avatar,
            status: userProfile.status,
            room: room
        });
        
        profileModal.hide();
    }
});

// Update Status Indicator
function updateStatusIndicator(status) {
    const indicator = document.querySelector('.status-indicator');
    indicator.className = 'status-indicator ' + status;
}

// Message received handler
function addMessage(message, isSystem = false) {
    const div = document.createElement('div');
    
    if (isSystem) {
        div.classList.add('system-message');
        div.textContent = message;
    } else {
        div.classList.add('message', 'new');
        div.classList.add(message.username === username ? 'own-message' : 'other-message');
        
        const avatar = message.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${message.username}`;
        
        div.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">
                    <img src="${avatar}" alt="${message.username}">
                </div>
                <div class="message-meta">
                    <span class="username">${message.username === username ? 'You' : message.username}</span>
                    <span class="time">${message.time}</span>
                </div>
            </div>
            <div class="message-content">
                <p class="text">${message.text}</p>
            </div>
        `;
    }
    
    messagesContainer.appendChild(div);
    
    // Trigger animation
    requestAnimationFrame(() => {
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update message handler to use enhanced animation
socket.on('message', (message) => {
    addMessage(message);
});

// User joined notification
socket.on('userJoined', (data) => {
    addMessage(data.message, true);
});

// User left notification
socket.on('userLeft', (data) => {
    addMessage(data.message, true);
});

// Handle typing events
socket.on('userTyping', (data) => {
    if (data.username !== username) {
        typingIndicator.classList.add('visible');
        typingIndicator.setAttribute('data-user', data.username);
    }
});

socket.on('userStoppedTyping', (data) => {
    if (data.username !== username) {
        typingIndicator.classList.remove('visible');
    }
});

// Update users list
socket.on('roomUsers', ({ users }) => {
    updateUsersCount(users.length);
    
    const currentUsers = Array.from(usersList.children).map(li => li.getAttribute('data-username'));
    const newUsers = users.filter(user => !currentUsers.includes(user.username));
    
    // Remove old users
    Array.from(usersList.children).forEach(li => {
        const username = li.getAttribute('data-username');
        if (!users.find(u => u.username === username)) {
            li.style.opacity = '0';
            li.style.transform = 'translateX(-20px)';
            setTimeout(() => li.remove(), 300);
        }
    });
    
    // Add new users
    newUsers.forEach(user => {
        const li = document.createElement('li');
        li.setAttribute('data-username', user.username);
        li.innerHTML = `
            <div class="user-list-item">
                <div class="user-avatar-small">
                    <img src="${user.avatar || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.username}`}" alt="${user.username}">
                    <span class="status-indicator ${user.status || 'online'}"></span>
                </div>
                <span class="username">${user.username}</span>
            </div>
        `;
        li.style.opacity = '0';
        li.style.transform = 'translateX(-20px)';
        usersList.appendChild(li);
        
        requestAnimationFrame(() => {
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';
        });
    });
});

// Update Users Count with Animation
function updateUsersCount(count) {
    const countElement = document.querySelector('.active-users-count .count');
    countElement.style.animation = 'none';
    countElement.offsetHeight; // Trigger reflow
    countElement.textContent = count;
    countElement.style.animation = 'countChange 0.3s ease-out';
}

// Handle Profile Updates
socket.on('profileUpdated', (data) => {
    const userItem = document.querySelector(`#users-list li[data-username="${data.username}"]`);
    if (userItem) {
        userItem.querySelector('img').src = data.avatar;
        userItem.querySelector('.status-indicator').className = `status-indicator ${data.status}`;
    }
});

// Enable notifications
if ('Notification' in window) {
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Notifications enabled');
        }
    });
}

// Show notification for new messages when window is not focused
document.addEventListener('visibilitychange', () => {
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        socket.on('message', (message) => {
            if (message.username !== username) {
                new Notification('New Message', {
                    body: `${message.username}: ${message.text}`,
                    icon: '/favicon.ico'
                });
            }
        });
    }
});

// Add error message animation
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message', 'alert', 'alert-danger');
    errorDiv.textContent = message;
    document.querySelector('.card-body').prepend(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}
