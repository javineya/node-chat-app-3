const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate username and room
    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        };
    }
    // check for existing user
    const userExists = users.find( user => {
        return user.room === room && user.username === username 
    })
    // validate username
    if (userExists) {
        return {
            error: 'Username is taken.'
        }
    }
    // save user
    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex( user => user.id === id )

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getRoomUsers = (room) => {
    return users.filter((user) => user.room === room)
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getRoomUsers
};