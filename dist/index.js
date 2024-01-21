import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
const PORT = process.env.PORT || 8000;
let friendReqs = [];
let friends = [];
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : [process.env.BASE_URL],
    },
});
app.get("/", (req, res) => res.send("Hello from server"));
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("joinRoom", ({ userData, roomId }) => {
        if (userData === null || userData === void 0 ? void 0 : userData.username) {
            socket.join(roomId);
            // socket.broadcast.to(roomId).emit("chatMessage", {
            //   username: "Admin",
            //   message: `${userData?.username} has joined the room.`,
            // });
        }
    });
    socket.on("join_notification", (userId) => {
        if (userId) {
            socket.join(userId);
        }
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
    socket.on("chatMessage", (message, roomId) => {
        io.to(roomId).emit("chatMessage", message);
    });
    socket.on("chat_notification", (message) => {
        if (message.type === "REQ") {
            const alreadyExists = friendReqs.find((user) => user.requester.id === message.senderId);
            if (!alreadyExists) {
                friendReqs = [
                    ...friendReqs,
                    {
                        requester: {
                            id: message.senderId,
                            username: message.username,
                            email: "",
                            image: message.image,
                        },
                    },
                ];
                io.to(message.receiverId || "").emit("friendreq_notification", friendReqs);
            }
        }
        io.to(message.receiverId || "").emit("chat_notification", message);
    });
    socket.on("deletefriendreq", (requesterId) => {
        friendReqs.filter((friend) => friend.requester.id !== requesterId);
    });
    socket.on("acceptfriendreq", (data) => {
        var _a, _b, _c, _d, _e, _f;
        friends = [
            {
                requester: {
                    id: (_a = data.requester) === null || _a === void 0 ? void 0 : _a.id,
                    username: (_b = data.requester) === null || _b === void 0 ? void 0 : _b.username,
                    image: (_c = data.requester) === null || _c === void 0 ? void 0 : _c.image,
                },
                receiver: {
                    id: (_d = data.receiver) === null || _d === void 0 ? void 0 : _d.id,
                    username: (_e = data.receiver) === null || _e === void 0 ? void 0 : _e.username,
                    image: (_f = data.receiver) === null || _f === void 0 ? void 0 : _f.image,
                },
            },
            ...friends,
        ];
        io.emit("updatedFriendsList", friends);
    });
});
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
