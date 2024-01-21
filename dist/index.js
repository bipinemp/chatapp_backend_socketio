"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
}));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
app.get("/", (req, res) => res.send("Hello from server"));
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("joinRoom", ({ username, roomId }) => {
        socket.join(roomId);
        io.to(roomId).emit("chatMessage", {
            username: "System",
            message: `${username} has joined the room.`,
        });
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
    socket.on("chatMessage", (message, roomId) => {
        io.to(roomId).emit("chatMessage", message);
    });
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
