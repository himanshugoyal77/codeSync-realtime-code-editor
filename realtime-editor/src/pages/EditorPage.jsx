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
  const codeRef = useRef(null);

  const [clients, setClients] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      setIsMobile(true);
    }
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
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
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

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room id copied to clipboard.");
    } catch (e) {
      toast.error("Failed to copy room id.");
    }
  }

  function leaveRoom() {
    socketRef.current.disconnect();
    reactNavigate("/");
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
              {isMobile && clients.length > 3 ? (
                <div className="clientsList">
                  {clients.slice(0, 3).map((client) => (
                    <Client key={client.socketId} username={client.username} />
                  ))}
                  <div className="moreClients">
                    +{clients.length - 3}
                    <br />
                    more
                  </div>
                </div>
              ) : (
                clients.map((client) => (
                  <Client key={client.socketId} username={client.username} />
                ))
              )}
            </div>
          </div>
        </div>
        <div className="btnWrapper">
          <button onClick={copyRoomId} className="btn copyBtn">
            Copy Room Id
          </button>
          <button onClick={leaveRoom} className="btn leaveBtn">
            Leave
          </button>
        </div>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => (codeRef.current = code)}
        />
      </div>
    </div>
  );
};

export default EditorPage;
