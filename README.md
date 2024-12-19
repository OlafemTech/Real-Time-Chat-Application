# Real-Time Chat Application

A modern, feature-rich chat application built with Node.js, Express, and Socket.IO that enables real-time communication between users in different chat rooms.

## Features

- 💬 Real-time messaging using WebSocket technology
- 👥 Group chat rooms
- 🔔 Desktop notifications for new messages
- 👤 Active users list
- 🚪 Join/leave notifications
- 📱 Responsive design for mobile and desktop
- ⌚ Message timestamps
- 🎨 Clean and modern UI with Bootstrap

## Technologies Used

- **Backend**
  - Node.js
  - Express.js
  - Socket.IO

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript
  - Bootstrap 5
  - Socket.IO Client

## Prerequisites

Before running this application, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 12.0 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Navigate to the project directory:
   ```bash
   cd real-time-chat-application
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use

1. Enter your username and desired room name on the login screen
2. Start chatting with other users in the same room
3. View active users in the sidebar
4. Receive desktop notifications when the window is not focused
5. Messages are color-coded: your messages appear in blue, others' in gray

## Project Structure

```
real-time-chat-application/
├── public/
│   ├── index.html      # Main HTML file
│   ├── style.css       # Stylesheet
│   └── main.js         # Frontend JavaScript
├── server.js           # Node.js server
├── package.json        # Project dependencies
└── README.md          # Documentation
```

## Features in Detail

### Real-Time Communication
- Instant message delivery using WebSocket
- No page refresh required
- Real-time user list updates

### Room Management
- Multiple chat rooms support
- Room-specific messages
- User join/leave notifications

### User Interface
- Clean and intuitive design
- Responsive layout
- Message timestamps
- Visual distinction between own and others' messages

### Notifications
- Desktop notifications for new messages
- Join/leave notifications in chat
- Active users list

## Contributing

Feel free to fork this project and submit pull requests. You can also open issues for bugs or feature requests.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

For any questions or feedback, please open an issue in the repository.
