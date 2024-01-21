import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
const PORT = process.env.PORT || 8000;

interface ChatMessage {
  senderId: string;
  message: string;
  createdAt: string;
  image?: string;
  username?: string;
}

interface UserData {
  id?: string;
  username?: string;
  password?: string | null;
  email?: string;
  emailVerified: string | null;
  image?: string | null;
}

interface UserDataa {
  id?: string;
  username?: string;
  password?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
}

interface FriendRequest {
  requester: UserDataa;
}

type FriendReqss = FriendRequest[];

type NotificationType = {
  message?: string;
  username?: string;
  image?: string;
  senderId?: string;
  receiverId?: string;
  type?: string;
  read?: boolean;
};

type TAcceptedFriends = {
  requester?: UserDataa;
  receiver?: UserDataa;
};

type TAcceptedFriedsArr = TAcceptedFriends[] | any[];

let friendReqs: FriendReqss = [];
let friends: TAcceptedFriedsArr = [];

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

app.get("/", (req, res) => res.send("Hello from server"));

io.on("connection", (socket: Socket) => {
  console.log("A user connected");
  console.log("fjdkl");

  socket.on(
    "joinRoom",
    ({ userData, roomId }: { userData: UserData; roomId: string }) => {
      if (userData?.username) {
        socket.join(roomId);
        // socket.broadcast.to(roomId).emit("chatMessage", {
        //   username: "Admin",
        //   message: `${userData?.username} has joined the room.`,
        // });
      }
    }
  );

  socket.on("join_notification", (userId: string) => {
    if (userId) {
      socket.join(userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("chatMessage", (message: ChatMessage, roomId: string) => {
    io.to(roomId).emit("chatMessage", message);
  });

  socket.on("chat_notification", (message: NotificationType) => {
    if (message.type === "REQ") {
      const alreadyExists = friendReqs.find(
        (user) => user.requester.id === message.senderId
      );

      if (!alreadyExists) {
        friendReqs = [
          ...friendReqs,
          {
            requester: {
              id: message.senderId,
              username: message.username,
              email: "",
              image: message.image || "",
            },
          },
        ];

        io.to(message.receiverId || "").emit(
          "friendreq_notification",
          friendReqs
        );
      }
    }
    io.to(message.receiverId || "").emit("chat_notification", message);
  });

  socket.on("deletefriendreq", (requesterId: string) => {
    friendReqs.filter((friend) => friend.requester.id !== requesterId);
  });

  socket.on("acceptfriendreq", (data: TAcceptedFriends) => {
    if (data?.receiver?.id && data?.requester?.id) {
      friends = [
        {
          requester: {
            id: data.requester?.id,
            username: data.requester?.username,
            image: data.requester?.image,
          },
          receiver: {
            id: data.receiver?.id,
            username: data.receiver?.username,
            image: data.receiver?.image,
          },
        },
        ...friends,
      ];

      io.emit("updatedFriendsList", friends);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
