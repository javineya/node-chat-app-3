const express               =   require('express');
const http                  =   require('http');
const path                  =   require('path');
const socketio              =   require('socket.io');
const Filter                =   require('bad-words');
const { generateMessage }   =   require('./utils/messages');
const { addUser, removeUser, 
    getUser, getRoomUsers } =   require('./utils/users');

// use of http.createServer allows socket.io to function
const app                   =   express();
const server                =   http.createServer(app);
const io                    =   socketio(server);

const port                  =   process.env.PORT || 3000;
const publicDirPath         =   path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

// create socket.io listeners
// add <script src="/socket.io/socket.io.js"></script> to HTML file
io.on('connection', (socket) => {
    console.log('new connection');

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not tolerated.');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        // io.to.emit/broadcast allows to send messages to rooms
        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined.`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        callback();
    });
});

// call server.listen due to use of socket.io
server.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});