import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: {
    token: localStorage.getItem("token") || "",
  },
});

export const refreshSocketAuth = () => {
  socket.auth = {
    token: localStorage.getItem("token") || "",
  };
};

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

socket.on("socket-error", (error) => {
  console.error("Socket error:", error);
});

socket.on("connect", () => {
  refreshSocketAuth();
});

export default socket;
