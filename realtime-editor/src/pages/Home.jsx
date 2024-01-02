import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast, { Toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success("New room created");
  };

  const joinRoom = () => {
    if (!roomId || !userName) {
      toast.error("Please fill all the fields");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: {
        userName,
      },
    });
  };

  const handleInputUp = (e) => {
    if (e.code === "Enter") joinRoom();
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          src="/code-sync.png"
          alt="code-syn-logo"
          className="homePageLogo"
        />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputUp}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USER NAME"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyUp={handleInputUp}
          />
          <button onClick={joinRoom} className="btn joinBtn">
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built with 💖 by{" "}
          <a target="_blank" href="https://github.com/himanshugoyal77">
            Himanshu Goyal
          </a>
        </h4>
      </footer>
    </div>
  );
};

export default HomePage;
