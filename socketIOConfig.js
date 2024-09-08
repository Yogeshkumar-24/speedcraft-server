const { Server } = require('socket.io');
const { getRandomWords } = require('./words');

const configureSocketIO = (io) => {
    const rooms = {};
    const countdownTime = 10;
    const MAX_ROOM_SIZE = 6; 
    const NO_OF_WORDS = 60;
    const socketToUsernameMap = new Map();
    
    io.on('connection', (socket) => {
        console.log(`User Connected ${socket.id}`);

        socket.on('join_room', (data) => {
            const { room, username } = data;

            if (!rooms[room]) {
                rooms[room] = { host: socket.id, participants: [socket.id], words: [], usernames: [username] };
                socket.join(room);
                socketToUsernameMap.set(socket.id, username);
                console.log(`User with id: ${socket.id} (host) created and joined the room ${room}`);
                const randomWordsForRoom = getRandomWords(NO_OF_WORDS);
                io.to(socket.id).emit('host', rooms[room].usernames);
                io.to(room).emit('random_words', randomWordsForRoom);
                io.to(room).emit('no_of_words', NO_OF_WORDS);
                rooms[room].words = randomWordsForRoom;
                io.to(room).emit('usernames', rooms[room].usernames);
            } else {
                const roomSize = rooms[room].participants.length;
                if (roomSize < MAX_ROOM_SIZE) {
                    rooms[room].participants.push(socket.id);
                    socket.join(room);
                    socketToUsernameMap.set(socket.id, username);
                    console.log(`User with id: ${socket.id} joined the room ${room}`);
                    io.to(socket.id).emit('random_words', rooms[room].words);
                    io.to(room).emit('usernames', rooms[room].usernames);
                    io.to(room).emit('no_of_words', NO_OF_WORDS);
                    rooms[room].usernames.push(username);
                } else {
                    // console.log("room full");
                    // io.to(socket.id).emit('room_full');
                    return;
                }
            }
            console.log(getRoomSize(room));
        });

        socket.on("room_size", (room) => {
            if (getRoomSize(room) > MAX_ROOM_SIZE - 1) {
                socket.emit("max_size_reached");
                console.log("filled");
            }
        });

        socket.on('get_usernames_in_room', (data) => {
            const usernames = getUsernamesInRoom(data.room);
            console.log(usernames);
            console.log(usernames.includes(data.username));
            if (usernames.includes(data.username)) {
                socket.emit('usernames_in_room', usernames);
                console.log("hello");
            }
        });

        socket.on("start_game_countdown", (room) => {
            if (rooms[room] && rooms[room].host === socket.id) {
                io.to(room).emit("game_start_countdown", countdownTime); // 10 seconds countdown
            }
        });

        socket.on("start_game", (room) => {
            if (rooms[room] && rooms[room].host === socket.id) {
                io.to(room).emit("start_game");
                console.log(`Game started in room ${room}`);
            }
        });

        socket.on('word_index_update', (data) => {
            io.to(data.room).emit('word_index_updated', { username: data.username, wordIndex: data.wordIndex, wrongWordCount: data.wrongWordCount });
        });

        socket.on("restart_game", (room) => {
            if (rooms[room]) {
                rooms[room].words = getRandomWords(NO_OF_WORDS);
                rooms[room].usernames = [];
                io.to(room).emit('usernames', rooms[room].usernames);
            }
        });

        socket.on('disconnect', () => {
            console.log('User', socket.id, 'Disconnected');

            Object.keys(rooms).forEach((room) => {
                if (rooms[room].host === socket.id) {
                    delete rooms[room];
                    console.log("Room", room, "deleted as host disconnected.");
                } else {
                    rooms[room].participants = rooms[room].participants.filter(participant => participant !== socket.id);
                    
                    const disconnectedUsername = socketToUsernameMap.get(socket.id);
                    
                    if (disconnectedUsername) {
                        socketToUsernameMap.delete(socket.id);
                        rooms[room].usernames = rooms[room].usernames.filter(username => username !== disconnectedUsername);
                        io.to(room).emit("user_disconnected", { username: disconnectedUsername });
                        io.to(room).emit("alt_usernames", rooms[room].usernames);
                        console.log("User", disconnectedUsername, "removed from room", room);
                    } else {
                        console.log("No username found for disconnected user:", socket.id);
                    }
                }
            });
        });

    });

    const getRoomSize = (room) => {
        return rooms[room] ? rooms[room].participants.length : 0;
    };

    const getUsernamesInRoom = (room) => {
        return rooms[room] ? rooms[room].usernames : [];
    };
};

module.exports = configureSocketIO;
