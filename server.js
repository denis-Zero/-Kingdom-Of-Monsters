const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const rooms = {};

app.use(express.static(path.join(__dirname)));

function sanitizeRoom(room) {
    if (typeof room !== "string") return "lobby";
    const cleaned = room.replace(/[^a-zA-Z0-9_-]/g, "").trim();
    return cleaned ? cleaned.slice(0, 20) : "lobby";
}

function sanitizeName(name) {
    if (typeof name !== "string") return "Jogador";
    const cleaned = name.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
    return cleaned ? cleaned.slice(0, 16) : "Jogador";
}

function ensureRoom(room) {
    if (!rooms[room]) {
        rooms[room] = {
            players: [],
            decks: {},
            names: {},
            seed: null,
            starter: null
        };
    }
    return rooms[room];
}

function removeFromRoom(room, id) {
    const data = rooms[room];
    if (!data) return;
    data.players = data.players.filter(p => p !== id);
    delete data.decks[id];
    delete data.names[id];
    if (data.players.length === 0) {
        delete rooms[room];
    }
}

io.on("connection", (socket) => {
    socket.on("tcgJoin", (data) => {
        const room = sanitizeRoom(data && data.room);
        const name = sanitizeName(data && data.name);
        const deck = Array.isArray(data && data.deck) ? data.deck : [];
        const roomData = ensureRoom(room);

        if (roomData.players.length >= 2) {
            socket.emit("tcgJoinError", { message: "Sala cheia." });
            return;
        }

        if (!deck || deck.length < 20) {
            socket.emit("tcgJoinError", { message: "Deck inválido." });
            return;
        }

        roomData.players.push(socket.id);
        roomData.decks[socket.id] = deck;
        roomData.names[socket.id] = name;
        socket.join(room);

        if (roomData.players.length === 2) {
            roomData.seed = Math.floor(Math.random() * 9999999);
            roomData.starter = roomData.players[Math.floor(Math.random() * roomData.players.length)];
            roomData.players.forEach((id) => {
                const opponentId = roomData.players.find(p => p !== id);
                io.to(id).emit("tcgStart", {
                    room,
                    seed: roomData.seed,
                    yourId: id,
                    starterId: roomData.starter,
                    opponentName: roomData.names[opponentId],
                    opponentDeck: roomData.decks[opponentId]
                });
            });
        } else {
            socket.emit("tcgWaiting", { room });
        }
    });

    socket.on("tcgCommand", (data) => {
        if (!data || !data.room) return;
        const room = sanitizeRoom(data.room);
        socket.to(room).emit("tcgCommand", data);
    });

    socket.on("disconnect", () => {
        Object.keys(rooms).forEach((room) => {
            if (rooms[room].players.includes(socket.id)) {
                socket.to(room).emit("tcgOpponentLeft", { id: socket.id });
                removeFromRoom(room, socket.id);
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Servidor TCG multiplayer em http://localhost:${PORT}`);
});
