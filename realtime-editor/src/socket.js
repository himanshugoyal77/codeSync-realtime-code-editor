import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 1000,
    transports: ["websocket"],
  };

  return io("codesync-realtime-code-editor-production.up.railway.app", options);
};
