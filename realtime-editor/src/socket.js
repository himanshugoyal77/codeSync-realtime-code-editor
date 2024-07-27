import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 1000,
    transports: ["websocket"],
  };

  return io("https://codesync-backend-vrlm.onrender.com", options);
};
