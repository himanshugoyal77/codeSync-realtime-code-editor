import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import Editor from "../components/Editor";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

import ACTIONS from "../actions";

import "./editorPage.css";
import { initSocket } from "../socket";
import toast from "react-hot-toast";

const EditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigate = useNavigate();

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(err) {
        toast.error("Connection failed. Please try again later.");
        reactNavigate("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state.userName,
      });

      // listen for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.userName) {
            toast.success(`${username} joined`);
          }
          setClients(clients);
        }
      );

      // listen for disconnected event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prevClients) =>
          prevClients.filter((client) => client.socketId !== socketId)
        );
      });
    };
    init();
    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    };
  }, []);

  if (!location.state?.userName || !roomId) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/code-sync.png" className="logoImg" alt="logo" />
          </div>
          <div className="connected">
            <h3 className="hide">Connected</h3>
            <div className="clientsList">
              {clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))}
            </div>
          </div>
        </div>
        <button className="btn copyBtn hide">Copy Room Id</button>
        <button className="btn leaveBtn hide">Leave</button>
      </div>
      <div className="editorWrap">
        <Editor socketRef={socketRef} roomId={roomId} />
      </div>
    </div>
  );
};

export default EditorPage;
